import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:open_route_service/open_route_service.dart';
import 'package:seamless_navigation/screens/outdoor_screen.dart';
import 'screens/location_screen.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  try {
    runApp(IndoorNavigationApp());
  } catch (e) {
    runApp(IndoorNavigationApp());
  }
}
 
class IndoorNavigationApp extends StatefulWidget {
  final OpenRouteService client = OpenRouteService(
    apiKey: dotenv.env["ORS_API_KEY"]!,
  );

  IndoorNavigationApp({super.key});

  @override
  State<IndoorNavigationApp> createState() => _IndoorNavigationAppState();
}

class _IndoorNavigationAppState extends State<IndoorNavigationApp> {
  bool _isIndoor = true;

  void _setNavigationMode(bool isIndoor) {
    setState(() {
      _isIndoor = isIndoor;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BLE Indoor Navigation',
      theme: _buildTheme(),
      home: _isIndoor
          ? LocationScreen(
              setNavigationMode: _setNavigationMode,
            )
          : OutdoorScreen(
              client: widget.client,
              setNavigationMode: _setNavigationMode,
            ),
    );
  }

  ThemeData _buildTheme() {
    return ThemeData(
      primarySwatch: Colors.teal,
      scaffoldBackgroundColor: Colors.grey[100],
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.teal,
        titleTextStyle: TextStyle(color: Colors.white, fontSize: 20),
      ),
      textTheme: const TextTheme(bodyMedium: TextStyle(color: Colors.black87)),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.teal,
          foregroundColor: Colors.white,
        ),
      ),
    );
  }
}
