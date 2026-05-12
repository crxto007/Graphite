const { parseFile } = require('../../parser');

// Test the hash.js file
async function testHashFile() {
  const hashFile = '/Users/christo/Desktop/Learnasigo/IDE/backend/test-watch/utils/hash.js';
  console.log(`Testing parser with file: ${hashFile}`);

  const result = await parseFile(hashFile);
  if (result) {
    console.log('Parsed hash.js result:');
    console.log(JSON.stringify(result, null, 2));

    // Test edge creation
    console.log('\n--- Testing Edge Descriptors for hash.js ---');
    const edges = result.imports.map(imp => ({
      from: result.id,
      to: imp,
      label: 'imports'
    }));
    console.log('Edge descriptors:', JSON.stringify(edges, null, 2));
  } else {
    console.log('Failed to parse hash.js file');
  }
}

testHashFile().catch(console.error);