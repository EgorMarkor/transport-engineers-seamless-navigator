import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/map.dart';

class MapService extends ChangeNotifier {
  MapModel? currentMap;

  Future<MapModel?> fetchMap(String bleId) async {
    final baseUrl = dotenv.env["SERVER_URL"];
    final url = Uri.parse('$baseUrl/map/$bleId');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        currentMap = MapModel.fromJson(jsonData);
        notifyListeners();
        return currentMap;
      }
    } catch (e) {
      return null;
    }

    return null;
  }

  void clear() {
    currentMap = null;
  }
}
