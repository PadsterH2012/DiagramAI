import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NodePalette } from '@/components/DiagramEditor/NodePalette'

describe('Enhanced NodePalette', () => {
  const mockOnNodeAdd = jest.fn()

  beforeEach(() => {
    mockOnNodeAdd.mockClear()
  })

  it('renders all node categories', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    // Check for category tabs
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Flowchart')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('Shapes')).toBeInTheDocument()
  })

  it('renders search box', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    expect(searchInput).toBeInTheDocument()
  })

  it('filters nodes based on search query', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    
    // Initially shows basic category nodes
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Decision')).toBeInTheDocument()
    
    // Search for 'server'
    fireEvent.change(searchInput, { target: { value: 'server' } })
    
    // Should show search results
    expect(screen.getByText(/result.*for.*server/)).toBeInTheDocument()
    expect(screen.getByText('Server')).toBeInTheDocument()
  })

  it('shows no results message when search yields no matches', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    expect(screen.getByText('No nodes found')).toBeInTheDocument()
    expect(screen.getByText('Try a different search term')).toBeInTheDocument()
  })

  it('hides category tabs when searching', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    
    // Category tabs should be visible initially
    expect(screen.getByText('Basic')).toBeInTheDocument()
    
    // Search for something
    fireEvent.change(searchInput, { target: { value: 'process' } })
    
    // Category tabs should be hidden during search
    expect(screen.queryByText('Basic')).not.toBeInTheDocument()
  })

  it('switches between categories', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    // Initially on Basic category
    expect(screen.getByText('Start')).toBeInTheDocument()
    
    // Click on Network category
    fireEvent.click(screen.getByText('Network'))
    
    // Should show network nodes
    expect(screen.getByText('Server')).toBeInTheDocument()
    expect(screen.getByText('Router')).toBeInTheDocument()
  })

  it('calls onNodeAdd when a node is clicked', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    // Click on a node
    fireEvent.click(screen.getByText('Start'))
    
    expect(mockOnNodeAdd).toHaveBeenCalledWith('start', {
      label: 'Start',
      icon: '▶️',
      color: '#10b981'
    })
  })

  it('displays node descriptions', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    expect(screen.getByText('Start point of the process')).toBeInTheDocument()
    expect(screen.getByText('Decision or branching point')).toBeInTheDocument()
  })

  it('shows proper search result count', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    
    // Search for 'process' - should find multiple results
    fireEvent.change(searchInput, { target: { value: 'process' } })
    
    // Should show result count (exact count may vary based on data)
    expect(screen.getByText(/\d+ result.*for.*process/)).toBeInTheDocument()
  })

  it('searches in node descriptions and types', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    
    // Search for 'endpoint' which appears in API description
    fireEvent.change(searchInput, { target: { value: 'endpoint' } })
    
    expect(screen.getByText('API')).toBeInTheDocument()
  })

  it('clears search results when search is cleared', () => {
    render(<NodePalette onNodeAdd={mockOnNodeAdd} />)
    
    const searchInput = screen.getByPlaceholderText('Search nodes...')
    
    // Search for something
    fireEvent.change(searchInput, { target: { value: 'server' } })
    expect(screen.getByText(/result.*for.*server/)).toBeInTheDocument()
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } })
    
    // Should go back to category view
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
  })
})