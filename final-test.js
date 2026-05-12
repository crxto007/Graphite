// Final test script to verify all functionality
const { parseFile } = require('./backend/parser');

async function runFinalTest() {
  console.log('=== FINAL COMPREHENSIVE TEST ===\n');

  const testFiles = [
    'backend/test-watch/test.js',
    'backend/test-watch/utils/hash.js',
    'backend/test-watch/api/user-service.js',
    'backend/test-watch/components/UserCard.jsx',
    'backend/test-watch/services/auth-service.js',
    'backend/test-watch/utils/helper.py'
  ];

  let allNodes = [];
  let allEdges = [];

  for (const filePath of testFiles) {
    console.log(`--- Testing ${filePath} ---`);
    const result = await parseFile(filePath);

    if (result) {
      allNodes.push(result);

      // Display node info
      console.log(`✓ Parsed: ${result.id}`);
      console.log(`  Type: ${result.type}, Label: ${result.label}`);

      if (result.imports.length > 0) {
        console.log(`  Imports (${result.imports.length}): ${result.imports.join(', ')}`);
        // Generate edges
        result.imports.forEach(imp => {
          allEdges.push({
            from: result.id,
            to: imp,
            label: 'imports'
          });
        });
      } else {
        console.log('  Imports: 0');
      }

      if (result.exports.length > 0) {
        console.log(`  Exports (${result.exports.length}): ${result.exports.join(', ')}`);
      } else {
        console.log('  Exports: 0');
      }
    } else {
      console.log(`✗ Failed to parse: ${filePath}`);
    }
    console.log('');
  }

  // Summary
  console.log('=== SUMMARY ===');
  console.log(`Successfully parsed: ${allNodes.length}/${testFiles.length} files`);

  console.log('\nBy file type:');
  const typeCounts = {};
  allNodes.forEach(node => {
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
  });
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`  ${type}: ${count}`);
  }

  console.log(`\nTotal edges (imports): ${allEdges.length}`);

  // Show sample of edges
  if (allEdges.length > 0) {
    console.log('\nSample edges:');
    allEdges.slice(0, 5).forEach(edge => {
      console.log(`  ${edge.from} --${edge.label}--> ${edge.to}`);
    });
    if (allEdges.length > 5) {
      console.log(`  ... and ${allEdges.length - 5} more`);
    }
  }

  // Test edge cases
  console.log('\n=== EDGE CASE TESTS ===');

  // Test non-existent file
  console.log('Testing non-existent file:');
  const nonExistent = await parseFile('non-existent-file.js');
  console.log(`Result: ${nonExistent}`); // Should be null

  // Test that we're in the right directory
  console.log('\nTesting directory resolution:');
  const testFile = await parseFile('backend/test-watch/test.js');
  if (testFile) {
    console.log(`File ID: ${testFile.id}`);
    console.log(`File path: ${testFile.filePath}`);
    console.log(`Expected to be relative to project root`);
  }
}

runFinalTest().catch(console.error);