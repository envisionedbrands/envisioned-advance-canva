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
import type { Board, CanvasNode, CanvasEdge, NodeType } from '@/types/canvas';

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

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge = addEdge(connection, edges);
      setEdges(newEdge);

      // TODO: Create edge in backend
      // For now, edges are ephemeral and not persisted
    },
    [edges]
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
    setSelectedNode(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
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

      {/* Node detail panel - will show when node is selected */}
      {selectedNode && (
        <div className="absolute right-0 top-0 h-full w-96 border-l bg-background p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold">Node Details</h3>
          <p className="text-sm text-muted-foreground">Node ID: {selectedNode}</p>
          {/* TODO: Implement full detail panel */}
        </div>
      )}
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
