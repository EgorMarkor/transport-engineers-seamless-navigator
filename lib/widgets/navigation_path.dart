import 'package:flutter/material.dart';
import 'package:vector_math/vector_math.dart' as vm;
import 'package:seamless_navigation/services/map_service.dart';
import '../models/navigation_graph.dart';

class NavigationPathWidget extends StatefulWidget {
  final MapService mapService;
  final vm.Vector2 userPosition;
  final Function(List<NavNode>)? onPathUpdated;

  const NavigationPathWidget({
    super.key,
    required this.mapService,
    required this.userPosition,
    this.onPathUpdated,
  });

  @override
  State<NavigationPathWidget> createState() => _NavigationPathWidgetState();
}

class _NavigationPathWidgetState extends State<NavigationPathWidget> {
  NavNode? destination;
  List<NavNode> _path = [];

  NavNode? _findNearestNode(vm.Vector2 position, List<NavNode> nodes) {
    if (nodes.isEmpty) return null;
    return nodes.reduce((a, b) =>
        (a.position - position).length < (b.position - position).length
            ? a
            : b);
  }

  void _computePath() {
    final currentMap = widget.mapService.currentMap;

    if (currentMap == null || destination == null) return;

    final navGraph = currentMap.navGraph;
    final start = _findNearestNode(widget.userPosition, navGraph.nodes);

    if (start == null) return;

    final computedPath = navGraph.findPath(start, destination!);
    setState(() {
      _path = computedPath;
    });
    widget.onPathUpdated?.call(_path);
  }

  @override
  Widget build(BuildContext context) {
    final currentMap = widget.mapService.currentMap;
    if (currentMap == null) {
      return const SizedBox.shrink();
    }
    final navGraph = currentMap.navGraph;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: DropdownButton<NavNode>(
            hint: const Text('Select Destination'),
            value: destination,
            items: navGraph.nodes
                .map((node) => DropdownMenuItem<NavNode>(
                      value: node,
                      child: Text(
                        '(${node.position.x.toStringAsFixed(1)}, '
                        '${node.position.y.toStringAsFixed(1)})',
                      ),
                    ))
                .toList(),
            onChanged: (node) {
              setState(() {
                destination = node;
              });
              _computePath();
            },
          ),
        ),
      ],
    );
  }
}
