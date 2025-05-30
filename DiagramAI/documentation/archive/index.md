# Documentation Archive Index

*Last Updated: December 30, 2024*

## Overview

This archive contains documentation that has been superseded, consolidated, or is no longer actively maintained. Files are preserved for historical reference and to maintain project continuity.

## Archived Files

### 1. SETUP_COMPLETE.md
**Archived Date**: December 30, 2024  
**Reason**: Superseded by comprehensive documentation structure  
**Replacement**: [Development Setup Guide](../development/setup-guide.md)  
**Content**: Initial project setup completion summary  

**Why Archived**:
- Information integrated into structured documentation
- Setup process evolved significantly
- Replaced by more comprehensive guides

### 2. agent-gitignore-template
**Archived Date**: December 30, 2024  
**Reason**: Specific to early MCP development phase  
**Replacement**: Standard .gitignore patterns in main repository  
**Content**: Template for agent-specific gitignore files  

**Why Archived**:
- MCP implementation approach changed
- Template no longer relevant to current architecture
- Standard gitignore patterns sufficient

## Migration History

### Documentation Reorganization (December 30, 2024)

#### Files Moved to New Structure

| Original Location | New Location | Reason |
|------------------|--------------|---------|
| `docs/API_REFERENCE.md` | `documentation/mcp/mcp-api-reference.md` | Organized by feature area |
| `docs/MCP_IMPLEMENTATION_PLAN.md` | `documentation/mcp/implementation-plan.md` | Consistent naming convention |
| `docs/MCP_AGENT_SETUP_GUIDE.md` | `documentation/mcp/agent-setup-guide.md` | Kebab-case naming |
| `docs/MCP_IMPLEMENTATION_TASK_LIST.md` | `documentation/mcp/implementation-task-list.md` | Organized structure |
| `docs/MCP_README.md` | `documentation/mcp/mcp-overview.md` | Descriptive naming |
| `docs/websocket-architecture.md` | `documentation/realtime/websocket-architecture.md` | Feature-based organization |
| `docs/DEPLOYMENT_GUIDE.md` | `documentation/deployment/docker-guide.md` | Specific deployment type |
| `docs/QUICK_START.md` | `documentation/development/quick-start.md` | Development-focused |
| `docs/TROUBLESHOOTING.md` | `documentation/development/troubleshooting.md` | Development support |
| `TESTING_SUMMARY.md` | `documentation/development/testing-framework.md` | Framework documentation |
| `SETTINGS_IMPLEMENTATION_SUMMARY.md` | `documentation/features/settings-management.md` | Feature documentation |

#### New Documentation Created

| Document | Purpose | Status |
|----------|---------|--------|
| `documentation/index.md` | Master documentation hub | ✅ Complete |
| `documentation/realtime/testing-guide.md` | Real-time testing documentation | ✅ Complete |
| `documentation/realtime/performance-optimization.md` | Performance optimization guide | ✅ Complete |
| `documentation/architecture/system-overview.md` | High-level architecture | ✅ Complete |
| `documentation/features/real-time-collaboration.md` | Collaboration features | ✅ Complete |

## Naming Convention Changes

### Old Convention
- UPPERCASE_WITH_UNDERSCORES.md
- Mixed case with spaces
- Inconsistent organization

### New Convention
- kebab-case-naming.md
- Consistent lowercase with hyphens
- Feature-based folder organization
- Descriptive file names

## Content Consolidation

### Eliminated Duplication
- Multiple MCP documents consolidated
- Testing information centralized
- Architecture documentation unified
- Feature documentation organized

### Improved Organization
- Feature-based folder structure
- Consistent cross-references
- Comprehensive index system
- Clear navigation paths

## Access to Archived Content

### Viewing Archived Files
```bash
# Navigate to archive directory
cd documentation/archive/

# List archived files
ls -la

# View specific archived file
cat SETUP_COMPLETE.md
```

### Git History
All archived files maintain their complete Git history:
```bash
# View file history before archiving
git log --follow documentation/archive/SETUP_COMPLETE.md

# Compare with previous versions
git show HEAD~1:SETUP_COMPLETE.md
```

## Restoration Process

If archived content needs to be restored:

1. **Identify Need**: Determine if archived content is still relevant
2. **Check Replacements**: Verify current documentation doesn't cover the need
3. **Extract Content**: Copy relevant sections from archived files
4. **Update Format**: Apply current documentation standards
5. **Integrate**: Add to appropriate current documentation
6. **Cross-reference**: Update index and navigation

## Archive Maintenance

### Regular Review
- **Quarterly**: Review archived content relevance
- **Before Major Releases**: Ensure no critical information lost
- **During Refactoring**: Check for applicable archived patterns

### Cleanup Policy
- **Keep for 1 Year**: Minimum retention period
- **Historical Value**: Preserve significant architectural decisions
- **Legal Requirements**: Maintain audit trail if required

## Related Documentation

### Current Active Documentation
- [Documentation Index](../index.md) - Master documentation hub
- [Development Setup](../development/setup-guide.md) - Current setup process
- [MCP Overview](../mcp/mcp-overview.md) - Current MCP documentation

### Migration Guides
- [Documentation Migration](../development/documentation-migration.md) - How content was reorganized
- [Naming Conventions](../development/code-standards.md) - Current standards

## Contact

For questions about archived content or restoration requests:
- **GitHub Issues**: Use `documentation` label
- **Discussions**: [GitHub Discussions](https://github.com/PadsterH2012/DiagramAI/discussions)
- **Direct Contact**: Create issue with `archive-restoration` label

---

**Note**: This archive preserves project history while maintaining a clean, organized documentation structure for current development.
