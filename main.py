import requests
import math
import time
from kivy.app import App
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.boxlayout import BoxLayout
from kivy.graphics import Color, Line, Ellipse, PushMatrix, PopMatrix, Rotate
from kivy.config import Config
from kivy.clock import Clock

Config.set('graphics', 'width', '300')  # Ширина экрана iPhone 15
Config.set('graphics', 'height', '600')  # Высота экрана iPhone 15
Config.set('graphics', 'resizable', False)  # Фиксированное соотношение сторон

class MapWidget(BoxLayout):
    def __init__(self, geojson_data, beacons, **kwargs):
        super().__init__(**kwargs)
        self.geojson_data = geojson_data
        self.beacons = beacons  # Данные маячков
        self.circle_radius = 5
        self.circle_position = (150, 300)  # Инициализируем начальное положение точки

    def update_circle_position(self, dt):
        # Вычисление координат красной точки на основе триангуляции
        if len(self.beacons) < 3:
            print("Недостаточно маячков для триангуляции")
            return

        # Найти три ближайших маячка (симуляция с RSSI = расстоянием)
        self.beacons.sort(key=lambda b: b['distance'])
        nearest_beacons = self.beacons[:3]

        # Координаты и расстояния до трёх ближайших маячков
        x1, y1, r1 = nearest_beacons[0]['x'], nearest_beacons[0]['y'], nearest_beacons[0]['distance']
        x2, y2, r2 = nearest_beacons[1]['x'], nearest_beacons[1]['y'], nearest_beacons[1]['distance']
        x3, y3, r3 = nearest_beacons[2]['x'], nearest_beacons[2]['y'], nearest_beacons[2]['distance']

        # Триангуляция
        A = 2 * (x2 - x1)
        B = 2 * (y2 - y1)
        C = r1 ** 2 - r2 ** 2 - x1 ** 2 + x2 ** 2 - y1 ** 2 + y2 ** 2
        D = 2 * (x3 - x2)
        E = 2 * (y3 - y2)
        F = r2 ** 2 - r3 ** 2 - x2 ** 2 + x3 ** 2 - y2 ** 2 + y3 ** 2

        # Решение уравнений для нахождения координат
        denominator = A * E - B * D
        if abs(denominator) > 1e-6:  # Избегаем деления на ноль
            new_x = (C * E - F * B) / denominator
            new_y = (A * F - C * D) / denominator
            self.circle_position = (new_x, new_y)
        else:
            print("Ошибка триангуляции: линии слишком близки или параллельны")

        # Перерисовка карты
        self.draw_map()

    def draw_map(self):
        self.canvas.clear()

        # Размеры окна
        window_width, window_height = self.size

        # Рисуем карту
        with self.canvas:
            PushMatrix()
            Rotate(angle=90, origin=(self.center_x, self.center_y))  # Поворот на 90 градусов
            Color(0.5, 0.5, 0.5, 1)  # Серый цвет для линий

            for feature in self.geojson_data['features']:
                geometry = feature.get('geometry', {})
                if geometry.get('type') == 'LineString':
                    coordinates = geometry.get('coordinates', [])
                    if coordinates:
                        scaled_points = [(x, y) for x, y in coordinates]
                        Line(points=sum(scaled_points, ()), width=2)

            # Рисуем красную точку
            Color(1, 0, 0, 1)  # Красный цвет
            x, y = self.circle_position
            Ellipse(pos=(x - self.circle_radius, y - self.circle_radius), size=(self.circle_radius * 2, self.circle_radius * 2))
            PopMatrix()

class BLEScannerApp(App):
    def build(self):
        # Главный макет
        self.layout = FloatLayout()

        # Получение GeoJSON данных и маячков
        geojson_data, beacons = self.get_data()

        # Виджет карты, растянутый на весь экран
        self.map_widget = MapWidget(geojson_data, beacons, size_hint=(1, 1), pos_hint={'x': 0, 'y': 0})
        self.layout.add_widget(self.map_widget)

        # Отрисовка карты
        self.map_widget.draw_map()

        # Запуск таймера для обновления положения точки
        Clock.schedule_interval(self.map_widget.update_circle_position, 0.65)

        return self.layout

    def get_data(self):
        # Получение GeoJSON данных
        response = requests.get("http://194.87.95.102/api/map/kvantorium")
        geojson_data = {"type": "FeatureCollection", "features": []}
        beacons = []

        if response.status_code == 200:
            raw_data = response.json()  # Parse response as JSON

            # Отфильтровать маячки (тип beacon) и GeoJSON объекты
            for feature in raw_data.get("features", []):
                geometry = feature.get("geometry", {})
                properties = feature.get("properties", {})
                if properties.get("type") == "beacon":
                    beacon = {
                        "x": geometry["coordinates"][0],
                        "y": geometry["coordinates"][1],
                        "distance": properties.get("rssi", 1)  # Симуляция расстояния
                    }
                    beacons.append(beacon)
                else:
                    geojson_data["features"].append(feature)

        return geojson_data, beacons


if __name__ == "__main__":
    BLEScannerApp().run()
