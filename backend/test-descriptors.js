const { parseFile } = require('./parser');

// Test multiple files to verify descriptors
async function testDescriptors() {
  console.log('=== Testing Node and Edge Descriptors ===\n');

  const testFiles = [
    'backend/test-watch/test.js',
    'backend/test-watch/utils/hash.js'
  ];

  const nodes = [];

  for (const filePath of testFiles) {
    console.log(`--- Parsing ${filePath} ---`);
    const result = await parseFile(filePath);
    if (result) {
      nodes.push(result);
      console.log('Node descriptor:');
      console.log(JSON.stringify(result, null, 2));

      // Generate edge descriptors from imports
      const edges = result.imports.map(imp => ({
        from: result.id,
        to: imp,
        label: 'imports'
      }));

      if (edges.length > 0) {
        console.log('Edge descriptors:');
        console.log(JSON.stringify(edges, null, 2));
      } else {
        console.log('No edges (no imports)');
      }
    } else {
      console.log(`Failed to parse ${filePath}`);
    }
    console.log('');
  }

  // Summary
  console.log('=== Summary ===');
  console.log(`Parsed ${nodes.length} files successfully:`);
  nodes.forEach(node => {
    console.log(`  - ${node.id} (${node.type}): ${node.label}`);
    if (node.imports.length > 0) {
      console.log(`    Imports: ${node.imports.join(', ')}`);
    }
    if (node.exports.length > 0) {
      console.log(`    Exports: ${node.exports.join(', ')}`);
    }
  });

  // Generate all edges
  console.log('\n=== All Edges ===');
  const allEdges = [];
  nodes.forEach(node => {
    node.imports.forEach(imp => {
      allEdges.push({
        from: node.id,
        to: imp,
        label: 'imports'
      });
    });
  });

  if (allEdges.length > 0) {
    console.log(JSON.stringify(allEdges, null, 2));
  } else {
    console.log('No edges found');
  }
}

testDescriptors().catch(console.error);