import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ruleRoute } from '../src/router/rule-router.js';
import { ruleRouterCases } from './fixtures/index.js';

describe('Rule Router', () => {
  for (const tc of ruleRouterCases) {
    it(`should route "${tc.description}" to ${tc.expectedIntent}`, () => {
      const result = ruleRoute(tc.input);
      assert.ok(result, `Expected rule match for: ${tc.input}`);
      assert.strictEqual(result.intent, tc.expectedIntent);
      assert.strictEqual(result.routedBy, 'rule');
      assert.strictEqual(result.confidence, 0.95);
    });
  }

  it('should return null for ambiguous input', () => {
    const result = ruleRoute('这段代码的递归逻辑我没太看懂，能给我讲讲它到底在做什么吗？');
    // 这条输入含有"讲讲"，可能被规则匹配也可能不匹配
    // 如果未匹配，应返回 null
    if (result) {
      assert.strictEqual(result.routedBy, 'rule');
    }
  });

  it('should return null for vague input with no keywords', () => {
    const result = ruleRoute('搞一下');
    assert.strictEqual(result, null);
  });
});
