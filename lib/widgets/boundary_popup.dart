import 'package:flutter/material.dart';

class BoundaryPopupWidget extends StatelessWidget {
  final VoidCallback onPress;
  final String labelText;

  const BoundaryPopupWidget({
    super.key,
    required this.onPress,
    required this.labelText,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.only(right: 0.8),
          child: Text(labelText),
        ),
        ElevatedButton(
          onPressed: onPress,
          child: const Text("Да"),
        ),
      ],
    );
  }
}
