
import { act } from '@testing-library/react';
import { useFavoritesStore } from '../src/store/useFavoritesStore.js';

beforeEach(() => {
  const { clear } = useFavoritesStore.getState();
  act(() => clear());
});

test('add/remove favorites works', () => {
  const u = { id: 1, login: 'mo', html_url: 'x' };
  act(() => useFavoritesStore.getState().add(u));
  expect(useFavoritesStore.getState().favorites).toEqual([u]);

  act(() => useFavoritesStore.getState().remove(1));
  expect(useFavoritesStore.getState().favorites).toEqual([]);
});
