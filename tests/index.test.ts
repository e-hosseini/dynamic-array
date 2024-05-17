import { DynamicArray } from '../src/index';
import clearAllMocks = jest.clearAllMocks;

describe('DynamicArray', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sorter = (a: number, b: number) => a - b;
  const keyExtractor = (item: number) => item.toString();

  test('should throw an error if maxLength is greater than reservedSize', () => {
    expect(() => new DynamicArray<number>({
      sorter,
      keyExtractor,
      maxLength: 2000,
      reservedSize: 1000,
    })).toThrow('maxLength cannot be greater than reservedSize');
  });

  test('should throw an error if initialFocusIndex is greater than reservedSize', () => {
    expect(() => new DynamicArray<number>({
      sorter,
      keyExtractor,
      initialFocusIndex: 1500,
      reservedSize: 1000,
    })).toThrow('initialFocusIndex cannot be greater than reservedSize');
  });

  test('should throw an error if prependItems length is greater than initialFocusIndex', () => {
    expect(() => new DynamicArray<number>({
      sorter,
      keyExtractor,
      prependItems: [1, 2, 3],
      initialFocusIndex: 2,
      reservedSize: 1000,
    })).toThrow('prependItems.length cannot be greater than initialFocusIndex');
  });

  test('should throw an error if appendItems length is greater than reservedSize - initialFocusIndex', () => {
    expect(() => new DynamicArray<number>({
      sorter,
      keyExtractor,
      appendItems: [1, 2, 3],
      initialFocusIndex: 5,
      reservedSize: 6,
      maxLength: 3,
    })).toThrow('appendItems.length cannot be greater than reservedSize - initialFocusIndex');
  });

  test('should prepend items to array correctly', () => {
    const mockOnFocusedIndexChange = jest.fn();
    const dynamicArray = new DynamicArray<number>({
      sorter,
      keyExtractor,
      initialFocusIndex: 5,
      reservedSize: 10,
      maxLength: 4,
      onFocusedIndexChange: mockOnFocusedIndexChange,
    });

    dynamicArray.prepend([3, 4, 5]);
    expect(dynamicArray.array).toEqual([null, null, null, 3, 4, 5, null, null, null, null]);
    expect(mockOnFocusedIndexChange).toHaveBeenLastCalledWith(5, 5);

    dynamicArray.prepend([1, 2]);
    expect(mockOnFocusedIndexChange).toHaveBeenLastCalledWith(3, 5);
    expect(dynamicArray.array).toEqual([1, 2, 3, 4, null, null, null, null, null, null]);

    dynamicArray.prepend([0], 1);
    expect(mockOnFocusedIndexChange).toHaveBeenLastCalledWith(5, 1);
    expect(dynamicArray.array.length).toEqual(10);
    expect(dynamicArray.array[5]).toEqual(2);
    expect(dynamicArray.array).toEqual([null, null, null, 0, 1, 2, 3, null, null, null]);

    clearAllMocks();

    dynamicArray.prepend([-1]);
    expect(dynamicArray.array.length).toEqual(10);
    expect(dynamicArray.array[5]).toEqual(2);
    expect(dynamicArray.array).toEqual([null, null, -1, 0, 1, 2, null, null, null, null]);
    expect(mockOnFocusedIndexChange).toHaveBeenCalledTimes(0);

  });

  test('should append items to array correctly', () => {
    const mockOnFocusedIndexChange = jest.fn();
    const dynamicArray = new DynamicArray<number>({
      sorter,
      keyExtractor,
      initialFocusIndex: 5,
      reservedSize: 10,
      maxLength: 4,
      onFocusedIndexChange: mockOnFocusedIndexChange,
    });

    dynamicArray.append([6, 7, 8]);
    expect(mockOnFocusedIndexChange).toHaveBeenLastCalledWith(5, 5);
    expect(dynamicArray.array).toEqual([null, null, null, null, null, 6, 7, 8, null, null]);

    dynamicArray.append([9, 10]);
    expect(mockOnFocusedIndexChange).toHaveBeenLastCalledWith(6, 5);
    expect(dynamicArray.array).toEqual([null, null, null, null, null, null, 7, 8, 9, 10]);

    dynamicArray.append([11], 7);
    expect(dynamicArray.array).toEqual([null, null, null, null, null, 8, 9, 10, 11, null]);
    expect(mockOnFocusedIndexChange).toHaveBeenLastCalledWith(5, 7);
    expect(dynamicArray.array.length).toEqual(10);
    expect(dynamicArray.array[5]).toEqual(8);

    clearAllMocks();

    dynamicArray.append([12]);
    expect(dynamicArray.array.length).toEqual(10);
    expect(dynamicArray.array).toEqual([null, null, null, null, null, null, 9, 10, 11, 12]);
    expect(mockOnFocusedIndexChange).toHaveBeenCalledWith(6, 5);
  });

});
