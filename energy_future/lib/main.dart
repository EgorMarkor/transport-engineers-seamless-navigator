import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

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

  // Переключение между экранами "Карта" и "Личный кабинет"
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  final List<Widget> _pages = <Widget>[
    MapScreen(),
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

// Экран с картой и меткой
class MapScreen extends StatefulWidget {
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  double _latitude = 37.7749;  // Начальные координаты
  double _longitude = -122.4194;

  // Обновление координат метки
  void _updateMarker(double latitude, double longitude) {
    setState(() {
      _latitude = latitude;
      _longitude = longitude;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Карта')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/map_placeholder.png', height: 200), // Заглушка карты
            SizedBox(height: 10),
            Text('Метка на координатах:'),
            Text('Широта: $_latitude, Долгота: $_longitude'),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _updateMarker(40.7128, -74.0060),  // Пример обновления
              child: Text('Обновить метку'),
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

class _ProfileScreenState extends State<ProfileScreen> {
  File? _image;  // Фото пользователя
  final ImagePicker _picker = ImagePicker();
  String _firstName = '';
  String _lastName = '';
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
            SizedBox(height: 20),
            Text(
              'Список билетов:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _tickets.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    leading: Icon(Icons.confirmation_number),
                    title: Text(_tickets[index]),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
