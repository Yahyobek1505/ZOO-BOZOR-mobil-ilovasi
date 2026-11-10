import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { translate } from '../constants/translations.ts';

const appRoot = path.resolve(import.meta.dirname, '..');
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : file.endsWith('.tsx') ? [file] : [];
  });
}
function canonical(value) {
  return value.normalize('NFC').replace(/[ʻʼ‘’]/g, "'").replace(/\s+/g, ' ').trim();
}
function visiblePhrases(source) {
  const phrases = new Set();
  for (const file of sourceFiles(path.join(appRoot, source))) {
    const code = readFileSync(file, 'utf8');
    for (const [, raw] of code.matchAll(/<Text\b[^>]*>([\s\S]*?)<\/Text>/g)) {
      const text = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 3 && !/[{}&]/.test(text) && /[A-Za-zА-Яа-яЎўҒғҚқҲҳ]/.test(text)) phrases.add(text);
    }
    for (const [, text] of code.matchAll(/\b(?:placeholder|title|label|accessibilityLabel)="([^"]{4,})"/g)) {
      if (!/[{}&]/.test(text)) phrases.add(text);
    }
  }
  return [...phrases];
}

test('every static Uzbek UI string on app screens has Russian and English copy', () => {
  const phrases = [...visiblePhrases('app'), ...visiblePhrases('components')];
  const unchangedData = new Set(['Britan Scottish Fold', 'Fold', 'Yunusobod', 'ZOO-BOZOR', 'soʻm']);
  const englishInterfaceCopy = new Set([
    'Something went wrong', 'Please reload the app to continue.',
    'Try Again', 'Error Details', 'View error details', 'Close error details',
  ]);
  const missing = [...new Set(phrases)]
    .filter((phrase) => !/^[\d., ]+$/.test(phrase) && !unchangedData.has(phrase) && !englishInterfaceCopy.has(phrase))
    .filter((phrase) =>
      canonical(translate(phrase, 'en')) === canonical(phrase)
      || canonical(translate(phrase, 'ru')) === canonical(phrase),
    );
  assert.deepEqual(missing, [], `Add translations for: ${missing.join(' | ')}`);
});

test('greetings, selected language labels, and tab labels are translated', () => {
  assert.equal(translate('Oʻzbekcha', 'en'), 'Uzbek');
  assert.equal(translate('Русский', 'en'), 'Russian');
  assert.equal(translate('English', 'ru'), 'Английский');
  assert.equal(translate('Google orqali kirish', 'ru'), 'Войти через Google');
  assert.equal(translate('Eʼlon berish', 'en'), 'Post a listing');
  assert.equal(translate('Xarita', 'ru'), 'Карта');
});

test('animal categories and editorial cards are localized', () => {
  const data = readFileSync(path.join(appRoot, 'constants/data.ts'), 'utf8');
  const categories = data.split('export const CATEGORIES = [')[1]?.split('];')[0] ?? '';
  const stories = data.split('export const STORIES = [')[1]?.split('];')[0] ?? '';
  const phrases = [...`${categories}\n${stories}`.matchAll(/(?:label|title|text): '([^']+)'/g)].map((match) => match[1]);
  const missing = [...new Set(phrases)].filter((phrase) =>
    translate(phrase, 'en') === phrase || translate(phrase, 'ru') === phrase,
  );
  assert.deepEqual(missing, [], `Add translations for: ${missing.join(' | ')}`);
});

test('Firebase sign-in error messages are localized', () => {
  const source = readFileSync(path.join(appRoot, 'hooks/useLogin.ts'), 'utf8');
  const messages = [
    ...source.matchAll(/'auth\/[^']+': '([^']+)'/g),
    ...source.matchAll(/return messages\[value\.code \?\? ''\] \|\| value\.data\?\.error \|\| value\.message \|\| '([^']+)'/g),
  ].map((match) => match[1]);
  const missing = messages.filter((phrase) =>
    translate(phrase, 'en') === phrase || translate(phrase, 'ru') === phrase,
  );
  assert.deepEqual(missing, [], `Add translations for: ${missing.join(' | ')}`);
});

test('translation preserves unsupported user-entered names', () => {
  assert.equal(translate('Mochi the cat', 'ru'), 'Mochi the cat');
});
