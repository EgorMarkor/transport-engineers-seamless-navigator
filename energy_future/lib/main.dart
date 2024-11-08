import 'package:flutter/material.dart';
import 'package:flutter_blue/flutter_blue.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:math';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Инженеры Транспорта',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: HomeScreen(),
    );
  }
}

// Главный экран с навигацией между вкладками
class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  final List<Widget> _pages = <Widget>[
    BeaconMapScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Карта'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Личный кабинет'),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

// Экран с определением местоположения через Bluetooth-маяки
class BeaconMapScreen extends StatefulWidget {
  @override
  _BeaconMapScreenState createState() => _BeaconMapScreenState();
}

class _BeaconMapScreenState extends State<BeaconMapScreen> {
  FlutterBlue _flutterBlue = FlutterBlue.instance;
  Map<String, double> _beaconDistances = {}; // Хранение расстояний до маяков
  String _closestBeacon = ''; // Самый близкий маяк

  @override
  void initState() {
    super.initState();
    _startScanning();
  }

  // Начало сканирования Bluetooth-маяков
  void _startScanning() {
    _flutterBlue.scan(timeout: Duration(seconds: 10)).listen((scanResult) {
      final device = scanResult.device;
      final rssi = scanResult.rssi;

      // Рассчитать расстояние на основе RSSI
      double distance = _calculateDistance(rssi);
      setState(() {
        _beaconDistances[device.name] = distance;
        _closestBeacon = _getClosestBeacon();
      });
    });
  }

  // Формула расчета расстояния (примерная, на основе RSSI и TX Power)
  double _calculateDistance(int rssi, {int txPower = -59}) {
    if (rssi == 0) {
      return -1.0; // Невозможно определить расстояние
    }
    double ratio = rssi / txPower;
    return pow(10, -ratio).toDouble();
  }

  // Получить ближайший маяк
  String _getClosestBeacon() {
    if (_beaconDistances.isEmpty) return 'Нет маяков';
    return _beaconDistances.entries.reduce((a, b) => a.value < b.value ? a : b).key;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Карта маяков')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Определение местоположения по Bluetooth-маякам',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            Text('Ближайший маяк: $_closestBeacon'),
            SizedBox(height: 10),
            Text('Расстояния до маяков:'),
            for (var entry in _beaconDistances.entries)
              Text('${entry.key}: ${entry.value.toStringAsFixed(2)} м'),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _startScanning,
              child: Text('Обновить сканирование'),
            ),
          ],
        ),
      ),
    );
  }
}
// Экран "Личный кабинет"
class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>  {
  File? _image;  // Фото пользователя
  final ImagePicker _picker = ImagePicker();
  String _firstName = '';
  String _lastName = '';
  String _phoneNumber = '';
  String _selectedValue = 'Билет 1';
  List<bool> _isExpanded = [false, false, false]; // Список состояний для каждой вкладки
  List<String> _tickets = ['Билет 1', 'Билет 2', 'Билет 3'];  // Пример списка билетов

  // Выбор изображения
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Личный кабинет')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: GestureDetector(
                onTap: _pickImage,
                child: CircleAvatar(
                  radius: 50,
                  backgroundImage: _image != null ? FileImage(_image!) : null,
                  child: _image == null ? Icon(Icons.camera_alt, size: 50) : null,
                ),
              ),
            ),
            SizedBox(height: 20),
            TextField(
              decoration: InputDecoration(labelText: 'Имя'),
              onChanged: (value) => setState(() => _firstName = value),
            ),
            TextField(
              decoration: InputDecoration(labelText: 'Фамилия'),
              onChanged: (value) => setState(() => _lastName = value),
            ),
            TextField(
              decoration: InputDecoration(labelText: 'Номер телефона'),
              onChanged: (value) => setState(() => _phoneNumber = value),
            ),
            SizedBox(height: 30),
            Row( // Используем Row для горизонтального расположения кнопок
              mainAxisAlignment: MainAxisAlignment.center, // Центрируем кнопки по горизонтали
              children: [
                ElevatedButton(
                  onPressed: () {
                    // Действие для первой кнопки
                  },
                  style: ButtonStyle(
    backgroundColor: MaterialStateProperty.all(Colors.purple), // Изменяем цвет фона кнопки на зеленый
    foregroundColor: MaterialStateProperty.all(Colors.white), // Изменяем цвет текста на кнопке на белый
    textStyle: MaterialStateProperty.all(TextStyle(fontSize: 16)), // Изменяем размер текста
  ),
                  child: Text('Войти'),
                ),
                SizedBox(width: 16), // Отступ между кнопками
                ElevatedButton(
                  onPressed: () {
                    // Действие для первой кнопки
                  },
                  style: ButtonStyle(
    backgroundColor: MaterialStateProperty.all(Colors.white), // Изменяем цвет фона кнопки на зеленый
    foregroundColor: MaterialStateProperty.all(Colors.purple), // Изменяем цвет текста на кнопке на белый
    textStyle: MaterialStateProperty.all(TextStyle(fontSize: 16)), // Изменяем размер текста
  ),
                  child: Text('Зарегестрироваться'),
                )],),
            SizedBox(height: 20),
            Text(
              'Список билетов:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            ExpansionPanelList(
                expansionCallback: (panelIndex, isExpanded) {
                  setState(() {
                    _isExpanded[panelIndex] = !isExpanded;
                  });
                },
                children: [
                  ExpansionPanel(
                    headerBuilder: (BuildContext context, bool isExpanded) {
                      return ListTile(title: Text(_tickets[0]));
                    },
                    body: ListTile(title: Text("Content for Panel 1")),
                    isExpanded: _isExpanded[0],
                  ),
                  ExpansionPanel(
                    headerBuilder: (BuildContext context, bool isExpanded) {
                      return ListTile(title: Text(_tickets[1]));
                    },
                    body: ListTile(title: Text("Content for Panel 2")),
                    isExpanded: _isExpanded[1],
                  ),
                  ExpansionPanel(
                    headerBuilder: (BuildContext context, bool isExpanded) {
                      return ListTile(title: Text(_tickets[2]));
                    },
                    body: ListTile(title: Text("Content for Panel 1")),
                    isExpanded: _isExpanded[2],
                  ),
                ],
              ),
          ],
        ),
      ),
      ),
    );
  }
}