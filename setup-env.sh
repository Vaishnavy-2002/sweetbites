#!/bin/bash
# SweetBites Environment Setup Script
# Run this script to set up environment variables for local development

echo "Setting up SweetBites environment variables..."

# Set Mapbox token
export REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FheWE5OSIsImEiOiJjbWZxY2U3bWcwcHM0MmluNTkxaHEzcDd1In0.nlgLV43KSw1e_AgyBVFuMQ

# Set API URL
export REACT_APP_API_URL=http://localhost:8000

echo "Environment variables set:"
echo "REACT_APP_MAPBOX_TOKEN: $REACT_APP_MAPBOX_TOKEN"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"

echo ""
echo "To make these permanent, add them to your shell profile:"
echo "echo 'export REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FheWE5OSIsImEiOiJjbWZxY2U3bWcwcHM0MmluNTkxaHEzcDd1In0.nlgLV43KSw1e_AgyBVFuMQ' >> ~/.zshrc"
echo "echo 'export REACT_APP_API_URL=http://localhost:8000' >> ~/.zshrc"
echo "source ~/.zshrc"

echo ""
echo "Environment setup complete! You can now start your React app."
