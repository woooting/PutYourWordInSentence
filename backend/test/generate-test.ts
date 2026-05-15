const BASE = 'http://localhost:3001'

async function main() {
  console.log('=== Backend API Test ===\n')

  // 1. Health
  console.log('[1] Health Check')
  try {
    const r = await fetch(`${BASE}/api/health`)
    const data = await r.json()
    console.log(`    Status: ${r.status}`)
    console.log(`    Body:   ${JSON.stringify(data)}`)
  } catch (e) {
    console.log(`    FAIL:  ${(e as Error).message}`)
  }
  console.log()

  // 2. Generate with 20 words
  console.log('[2] POST /api/generate (20 words)')
  const words = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle',
    'forest', 'garden', 'heaven', 'island', 'jungle',
    'kitten', 'lemon', 'mountain', 'noodle', 'orange',
    'pencil', 'queen', 'rabbit', 'silver', 'tiger',
  ]
  try {
    const r = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words }),
    })
    console.log(`    Status:  ${r.status}`)
    console.log(`    Headers: ${JSON.stringify(Object.fromEntries(r.headers))}`)
    const data = await r.json()
    console.log(`    Body code:   ${data.code}`)
    console.log(`    Body msg:    ${data.msg}`)
    if (data.data) {
      console.log(`    Body data.sentences: ${data.data.sentences?.length ?? 0}`)
      console.log(`    Body data.failed:   ${data.data.failed?.length ?? 0}`)
      if (data.data.sentences?.length > 0) {
        const s = data.data.sentences[0]
        console.log(`    First item word:    ${s.word}`)
        console.log(`    First item chinese: ${s.chinese}`)
      }
    } else {
      console.log(`    Body data: null`)
    }
  } catch (e) {
    console.log(`    FAIL: ${(e as Error).message}`)
  }
  console.log()

  // 3. Generate with 19 words (should fail)
  console.log('[3] POST /api/generate (19 words - should be rejected)')
  try {
    const r = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: words.slice(0, 19) }),
    })
    const data = await r.json()
    console.log(`    code: ${data.code}`)
    if (data.code === 1) {
      console.log(`    PASS: correctly rejected`)
    } else {
      console.log(`    FAIL: expected code 1, got ${data.code}`)
    }
  } catch (e) {
    console.log(`    FAIL: ${(e as Error).message}`)
  }
}

main()
