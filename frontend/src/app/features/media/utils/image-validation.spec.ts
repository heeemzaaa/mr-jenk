import { describe, expect, it } from 'vitest';

import { validateImageFiles } from './image-validation';

function makeFile(sizeInBytes: number, name: string, type: string): File {
  return new File([new Uint8Array(sizeInBytes)], name, { type });
}

describe('validateImageFiles', () => {
  it('accepts an image under 2MB', () => {
    const file = makeFile(1024, 'photo.png', 'image/png');

    const { valid, errors } = validateImageFiles([file]);

    expect(valid).toEqual([file]);
    expect(errors).toEqual([]);
  });

  it('rejects a non-image file', () => {
    const file = makeFile(1024, 'notes.txt', 'text/plain');

    const { valid, errors } = validateImageFiles([file]);

    expect(valid).toEqual([]);
    expect(errors).toEqual(['"notes.txt" is not an image.']);
  });

  it('rejects an image larger than 2MB', () => {
    const file = makeFile(2 * 1024 * 1024 + 1, 'huge.png', 'image/png');

    const { valid, errors } = validateImageFiles([file]);

    expect(valid).toEqual([]);
    expect(errors).toEqual(['"huge.png" is larger than 2MB.']);
  });

  it('splits a mixed batch into valid files and error messages', () => {
    const good = makeFile(1024, 'good.png', 'image/png');
    const bad = makeFile(1024, 'bad.txt', 'text/plain');

    const { valid, errors } = validateImageFiles([good, bad]);

    expect(valid).toEqual([good]);
    expect(errors).toEqual(['"bad.txt" is not an image.']);
  });
});
