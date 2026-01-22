'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { BaseNode } from './nodes/base-node';
import { SourceNode } from './nodes/source-node';
import { InsightNode } from './nodes/insight-node';
import { OutputNode } from './nodes/output-node';
import { CanvasToolbar } from './toolbar/canvas-toolbar';
import { NodeDetailPanel } from './panels/node-detail-panel';
import type { Board, CanvasNode, CanvasEdge, NodeType, NodeData } from '@/types/canvas';

const nodeTypes = {
  text: BaseNode,
  source: SourceNode,
  insight: InsightNode,
  output: OutputNode,
  framework: BaseNode,
  campaign: BaseNode,
};

interface BoardCanvasProps {
  board: Board;
  initialNodes: CanvasNode[];
  initialEdges: CanvasEdge[];
}

function BoardCanvasInner({
  board,
  initialNodes,
  initialEdges,
}: BoardCanvasProps) {
  // Convert CanvasNode[] to React Flow Node[]
  const [nodes, setNodes] = useState<Node[]>(
    initialNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        label: node.data.label || 'Untitled',
      },
    }))
  );

  // Convert CanvasEdge[] to React Flow Edge[]
  const [edges, setEdges] = useState<Edge[]>(
    initialEdges.map((edge) => ({
      id: edge.id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      label: edge.label || undefined,
      animated: edge.metadata?.animated || false,
    }))
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Find the full node object for the selected node
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Sync position changes to backend
      const positionChanges = changes.filter(
        (change): change is NodeChange & { id: string; position: { x: number; y: number } } =>
          change.type === 'position' &&
          'id' in change &&
          'position' in change &&
          change.position !== undefined
      );

      if (positionChanges.length > 0) {
        // Debounce this in production
        const updates = positionChanges.map((change) => ({
          id: change.id,
          updates: {
            position: change.position,
          },
        }));

        fetch(`/api/boards/${board.id}/nodes`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: updates }),
        }).catch(console.error);
      }
    },
    [board.id]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));

      // Handle edge deletion
      const removedEdges = changes.filter((change) => change.type === 'remove');
      if (removedEdges.length > 0) {
        removedEdges.forEach((change) => {
          if ('id' in change) {
            fetch(`/api/boards/${board.id}/edges/${change.id}`, {
              method: 'DELETE',
            }).catch(console.error);
          }
        });
      }
    },
    [board.id]
  );

  const handleConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Optimistically add edge to UI
      const newEdge = addEdge(connection, edges);
      setEdges(newEdge);

      // Persist to backend
      try {
        const response = await fetch(`/api/boards/${board.id}/edges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: connection.source,
            target: connection.target,
          }),
        });

        if (!response.ok) {
          console.error('Failed to create edge');
          // Revert optimistic update
          setEdges((eds) =>
            eds.filter(
              (e) =>
                !(e.source === connection.source && e.target === connection.target)
            )
          );
        }
      } catch (error) {
        console.error('Error creating edge:', error);
        // Revert optimistic update
        setEdges((eds) =>
          eds.filter(
            (e) =>
              !(e.source === connection.source && e.target === connection.target)
          )
        );
      }
    },
    [board.id, edges]
  );

  const handleAddNode = useCallback(
    async (type: NodeType) => {
      // Calculate center position with slight offset
      const newNode = {
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          label: `New ${type} node`,
          content: '',
        },
      };

      try {
        const response = await fetch(`/api/boards/${board.id}/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNode),
        });

        if (response.ok) {
          const { node } = await response.json();

          setNodes((nds) => [
            ...nds,
            {
              id: node.id,
              type: node.type,
              position: node.position,
              data: {
                ...node.data,
                label: node.data.label || 'Untitled',
              },
            },
          ]);
        }
      } catch (error) {
        console.error('Error creating node:', error);
      }
    },
    [board.id]
  );

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleUpdateNode = useCallback(
    async (nodeId: string, updates: Partial<NodeData>) => {
      try {
        // Optimistically update UI
        setNodes((nds) =>
          nds.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    ...updates,
                  },
                }
              : node
          )
        );

        // Sync to backend
        const response = await fetch(`/api/boards/${board.id}/nodes/${nodeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: updates }),
        });

        if (!response.ok) {
          console.error('Failed to update node');
          // TODO: Revert optimistic update on error
        }
      } catch (error) {
        console.error('Error updating node:', error);
      }
    },
    [board.id]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      <CanvasToolbar onAddNode={handleAddNode} boardTitle={board.title} />

      <div className="h-full pt-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeClassName={(node) => {
              switch (node.type) {
                case 'source':
                  return 'fill-blue-400';
                case 'insight':
                  return 'fill-purple-400';
                case 'output':
                  return 'fill-green-400';
                default:
                  return 'fill-gray-400';
              }
            }}
          />
        </ReactFlow>
      </div>

      {/* Node detail panel */}
      <NodeDetailPanel
        node={selectedNode}
        boardId={board.id}
        onClose={handleClosePanel}
        onUpdate={handleUpdateNode}
      />
    </div>
  );
}

export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <ReactFlowProvider>
      <BoardCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
