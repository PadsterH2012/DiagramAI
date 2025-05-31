import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DiagramEditor } from '../DiagramEditor'

// Mock React Flow to avoid canvas rendering issues in tests
jest.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, ...props }: any) => (
    <div data-testid="react-flow" {...props}>{children}</div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  Panel: ({ children, ...props }: any) => (
    <div data-testid="panel" {...props}>{children}</div>
  ),
  useNodesState: () => [[], jest.fn()],
  useEdgesState: () => [[], jest.fn()],
  addEdge: jest.fn(),
  useReactFlow: () => ({
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn(),
    setEdges: jest.fn(),
  }),
}))

// Mock the feature flags
let mockAIChatEnabled = true
jest.mock('../../../lib/featureFlags', () => ({
  featureFlags: {
    get aiChat() { return mockAIChatEnabled }
  }
}))

// Mock other complex components to focus on feature flag testing
jest.mock('../ReactFlowEditor', () => ({
  ReactFlowEditor: ({ children, ...props }: any) => (
    <div data-testid="react-flow-editor" {...props}>{children}</div>
  )
}))

jest.mock('../SlideOutMenu', () => ({
  SlideOutMenu: ({ children, ...props }: any) => (
    <div data-testid="slide-out-menu" {...props}>{children}</div>
  )
}))

jest.mock('../MovableChatbox', () => ({
  MovableChatbox: ({ children, ...props }: any) => (
    <div data-testid="movable-chatbox" {...props}>{children}</div>
  )
}))

jest.mock('../NodePropertiesPanel', () => ({
  NodePropertiesPanel: ({ children, ...props }: any) => (
    <div data-testid="node-properties-panel" {...props}>{children}</div>
  )
}))

jest.mock('../KeyboardShortcutsPanel', () => ({
  KeyboardShortcutsPanel: ({ children, ...props }: any) => (
    <div data-testid="keyboard-shortcuts-panel" {...props}>{children}</div>
  )
}))

const mockSettingsStorage = {
  loadSettings: jest.fn(),
  saveSettings: jest.fn(),
  clearSettings: jest.fn(),
}
const mockAIProviderService = {
  validateApiKey: jest.fn(),
}

describe('DiagramEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when AI chat is enabled', () => {
    beforeEach(() => {
      mockAIChatEnabled = true
    })

    it('should show AI Chat button in toolbar', () => {
      render(<DiagramEditor />)
      
      expect(screen.getByText('🤖 AI Chat')).toBeInTheDocument()
    })

    it('should render MovableChatbox component', () => {
      render(<DiagramEditor />)
      
      expect(screen.getByTestId('movable-chatbox')).toBeInTheDocument()
    })
  })

  describe('when AI chat is disabled', () => {
    beforeEach(() => {
      mockAIChatEnabled = false
    })

    it('should hide AI Chat button from toolbar', () => {
      render(<DiagramEditor />)
      
      expect(screen.queryByText('🤖 AI Chat')).not.toBeInTheDocument()
    })

    it('should not render MovableChatbox component', () => {
      render(<DiagramEditor />)
      
      expect(screen.queryByTestId('movable-chatbox')).not.toBeInTheDocument()
    })

    it('should still show other toolbar buttons', () => {
      render(<DiagramEditor />)
      
      expect(screen.getByText('📋 Copy')).toBeInTheDocument()
      expect(screen.getByText('📄 Paste')).toBeInTheDocument()
      expect(screen.getByText('🎨 Properties')).toBeInTheDocument()
      expect(screen.getByText('❓ Help')).toBeInTheDocument()
    })
  })

  describe('basic functionality', () => {
    beforeEach(() => {
      mockAIChatEnabled = true
    })

    it('should render without crashing', () => {
      render(<DiagramEditor />)
      
      expect(screen.getByText('Visual Editor')).toBeInTheDocument()
    })

    it('should show default toolbar buttons', () => {
      render(<DiagramEditor />)
      
      expect(screen.getByText('📋 Copy')).toBeInTheDocument()
      expect(screen.getByText('📄 Paste')).toBeInTheDocument()
      expect(screen.getByText('🗑️ Delete')).toBeInTheDocument()
      expect(screen.getByText('🎨 Properties')).toBeInTheDocument()
      expect(screen.getByText('❓ Help')).toBeInTheDocument()
    })

    it('should render main editor components', () => {
      render(<DiagramEditor />)
      
      expect(screen.getByTestId('slide-out-menu')).toBeInTheDocument()
      expect(screen.getByTestId('react-flow-editor')).toBeInTheDocument()
    })
  })
})