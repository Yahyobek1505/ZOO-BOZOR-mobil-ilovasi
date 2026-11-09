import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CreateListingBody, RequestListingUploadBody } from '../../../lib/api-zod/src/generated/api.ts';

const listing = () => ({
  id: 'listing-test-123',
  title: 'Britan mushugi',
  category: 'mushuk',
  price: 10000,
  negotiable: true,
  images: ['/api/storage/images/12345678-1234-1234-1234-123456789abc'],
  breed: 'Britan',
  age: '5 oylik',
  gender: 'erkak',
  count: 1,
  documents: 'Hujjatsiz',
  weight: '2 kg',
  color: 'Kulrang',
  city: 'Toshkent',
  district: 'Markaz',
  geo: { lat: 41.31, lng: 69.28 },
  description: 'Sogʻlom mushuk uchun sinov tavsifi',
  phone: '998901234567',
  sellerName: 'Sotuvchi',
  delivery: false,
  vaccinated: true,
});

test('listing contract preserves individual contact and optional animal details', () => {
  const parsed = CreateListingBody.parse(listing());
  assert.equal(parsed.phone, '998901234567');
  assert.equal(parsed.count, 1);
  assert.equal(parsed.documents, 'Hujjatsiz');
});

test('client cannot assign identity, timestamps, metrics or ownership flags', () => {
  const parsed = CreateListingBody.parse({
    ...listing(), ownerId: 'another-user', own: true, createdAt: 1, rating: 5, views: 999,
  });
  for (const key of ['ownerId', 'own', 'createdAt', 'rating', 'views']) assert.equal(key in parsed, false);
});

test('gallery URIs, remote URLs, empty galleries and oversized galleries cannot be published', () => {
  for (const images of [
    ['file:///photo.jpg'], ['blob:photo'], ['data:image/png;base64,abc'],
    ['https://example.com/image.jpg'], [],
    Array(9).fill(listing().images[0]),
  ]) assert.equal(CreateListingBody.safeParse({ ...listing(), images }).success, false);
});

test('phone, category, price and coordinates are validated on the server boundary', () => {
  for (const change of [
    { phone: '' }, { phone: '99890abc4567' }, { phone: '901234567' },
    { category: 'unknown' }, { price: -1 }, { price: 999 }, { price: Infinity },
    { geo: { lat: 91, lng: 69 } }, { geo: { lat: 41, lng: -181 } },
    { count: 0 }, { count: 1.5 }, { count: 1000 },
  ]) assert.equal(CreateListingBody.safeParse({ ...listing(), ...change }).success, false);
});

test('uploads accept only supported images with explicit size bounded to 10 MiB', () => {
  assert.equal(RequestListingUploadBody.safeParse({ contentType: 'image/jpeg', size: 1024 }).success, true);
  for (const input of [
    { contentType: 'text/html', size: 1024 },
    { contentType: 'image/svg+xml', size: 1024 },
    { contentType: 'image/jpeg', size: 0 },
    { contentType: 'image/png', size: 10485761 },
    { contentType: 'image/webp', size: 1.5 },
  ]) assert.equal(RequestListingUploadBody.safeParse(input).success, false);
});
