import 'package:flutter/material.dart';

class AddressWidget extends StatelessWidget {
  final TextEditingController _addressController = TextEditingController();
  final Function(String) onSubmitted;

  AddressWidget({
    super.key,
    required this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _addressController,
              decoration: const InputDecoration(
                hintText: 'Введите адресс назначения',
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              final address = _addressController.text;
              if (address.isNotEmpty) onSubmitted(address);
            },
          ),
        ],
      ),
    );
  }
}
