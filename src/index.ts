type DynamicArrayConfig<T> = {
  reservedSize?: number;
  maxLength?: number;
  initialFocusIndex?: number;
  prependItems?: T[];
  appendItems?: T[];
  onFocusedIndexChange?: (index: number, lastIndex: number) => void;
  sorter: (a: T, b: T) => number;
  keyExtractor: (item: T) => string;
};

const defaultConfig = {
  reservedSize: 10000,
  maxLength: 1000,
  initialFocusIndex: 5000,
  prependItems: [],
  appendItems: [],
  onFocusedIndexChange: () => {},
  sorter: () => 0,
  keyExtractor: (item: unknown) => String(item),
} satisfies Required<DynamicArrayConfig<unknown>>;

export class DynamicArray<T extends number | string | object> {
  readonly #config: Required<DynamicArrayConfig<T>> = defaultConfig;

  array: (T | null)[] = [];
  #focusedIndex = this.#config.initialFocusIndex;
  #focusedKey: string | null = null;

  constructor(config: DynamicArrayConfig<T>) {
    this.#config = {
      ...defaultConfig,
      ...config,
    };

    this.#focusedIndex = this.#config.initialFocusIndex;

    this.#checkConfig();

    this.array = new Array(this.#config.reservedSize).fill(null);
  }

  #checkConfig() {
    if (this.#config.sorter === defaultConfig.sorter) {
      throw new Error('sorter is required');
    }

    if (this.#config.keyExtractor === defaultConfig.keyExtractor) {
      throw new Error('keyExtractor is required');
    }

    if (this.#config.maxLength > this.#config.reservedSize) {
      throw new Error('maxLength cannot be greater than reservedSize');
    }

    if (this.#config.initialFocusIndex > this.#config.reservedSize) {
      throw new Error('initialFocusIndex cannot be greater than reservedSize');
    }

    if (this.#config.prependItems.length > this.#config.initialFocusIndex) {
      throw new Error(
        'prependItems.length cannot be greater than initialFocusIndex'
      );
    }

    if (
      this.#config.appendItems.length >
      this.#config.reservedSize - this.#config.initialFocusIndex
    ) {
      throw new Error(
        'appendItems.length cannot be greater than reservedSize - initialFocusIndex'
      );
    }
  }

  append(newItems: T[], newFocusedIndex?: number) {
    if (newFocusedIndex !== undefined) {
      this.setFocusedIndex(newFocusedIndex);
    }

    const newArray = this.#getCombinedSortedArray(newItems);
    const cleanedArray = this.#cleanUpSourceArray(newArray, 'TOP');
    this.#updateArrayBasedOnFocusedItem(cleanedArray, 'BOTTOM');
  }

  prepend(newItems: T[], newFocusedIndex?: number) {
    if (newFocusedIndex !== undefined) {
      this.setFocusedIndex(newFocusedIndex);
    }

    const newArray = this.#getCombinedSortedArray(newItems);
    const cleanedArray = this.#cleanUpSourceArray(newArray, 'BOTTOM');
    this.#updateArrayBasedOnFocusedItem(cleanedArray, 'TOP');
  }

  setFocusedIndex(index: number) {
    this.#focusedIndex = index;
    this.#focusedKey =
      this.array[index] === null
        ? null
        : this.#config.keyExtractor(this.array[index]!);

    if (this.array[index] === null) {
      throw new Error('Cannot set focused index to null');
    }
  }

  #updateArrayBasedOnFocusedItem(arr: T[], base: 'TOP' | 'BOTTOM') {
    const { initialFocusIndex, reservedSize, keyExtractor } = this.#config;
    const firstNonNullIndex = this.array.findIndex((item) => item !== null);
    const lastNonNullIndex = this.array
      .slice()
      .reverse()
      .findIndex((item) => item !== null);

    if (firstNonNullIndex === -1 && lastNonNullIndex === -1) {
      if (base === 'BOTTOM') {
        this.array = [
          ...new Array(reservedSize - initialFocusIndex).fill(null),
          ...arr,
          ...new Array(initialFocusIndex - arr.length).fill(null),
        ];
        this.#updateFocusedIndex(initialFocusIndex);
      } else if (base === 'TOP') {
        this.array = [
          ...new Array(initialFocusIndex - arr.length + 1).fill(null),
          ...arr,
          ...new Array(reservedSize - initialFocusIndex - 1).fill(null),
        ];

        this.#updateFocusedIndex(initialFocusIndex);
      }
      return;
    }

    const focusedItemIndexInArr = arr.findIndex(
      (item) => keyExtractor(item) === this.#focusedKey
    );
    if (focusedItemIndexInArr === -1) {
      if (base === 'BOTTOM') {
        this.array = [
          ...new Array(reservedSize - arr.length).fill(null),
          ...arr,
        ];
        this.#updateFocusedIndex(reservedSize - arr.length);
      } else if (base === 'TOP') {
        this.array = [
          ...arr,
          ...new Array(reservedSize - arr.length).fill(null),
        ];
        this.#updateFocusedIndex(arr.length - 1);
      } else {
        this.array = [
          ...new Array(initialFocusIndex - arr.length).fill(null),
          ...arr,
          ...new Array(reservedSize - initialFocusIndex + arr.length).fill(
            null
          ),
        ];
        this.#updateFocusedIndex(initialFocusIndex);
      }

      return;
    }

    const beforeFocusArr = arr.slice(0, focusedItemIndexInArr);
    const afterFocusArr = arr.slice(focusedItemIndexInArr);

    const isArrayGetMinusIndex = this.#focusedIndex - beforeFocusArr.length < 0;
    const isArrayGetOutOfBound =
      this.#focusedIndex + afterFocusArr.length >= reservedSize;

    // if array get out of bound, we will move the items to the center of the array
    // and update the focused index
    if (isArrayGetMinusIndex || isArrayGetOutOfBound) {
      const newFocusedIndex = Math.floor(reservedSize / 2);
      this.array = [
        ...new Array(newFocusedIndex - beforeFocusArr.length).fill(null),
        ...beforeFocusArr,
        ...afterFocusArr,
        ...new Array(newFocusedIndex - afterFocusArr.length).fill(null),
      ];
      this.#updateFocusedIndex(newFocusedIndex);

      return;
    } else {
      this.array = [
        ...new Array(this.#focusedIndex - beforeFocusArr.length).fill(null),
        ...beforeFocusArr,
        ...afterFocusArr,
        ...new Array(
          reservedSize - this.#focusedIndex - afterFocusArr.length
        ).fill(null),
      ];
    }
  }

  #updateFocusedIndex(newFocusedIndex: number) {
    const { onFocusedIndexChange } = this.#config;
    const lastIndex = this.#focusedIndex;
    this.setFocusedIndex(newFocusedIndex);
    onFocusedIndexChange(newFocusedIndex, lastIndex);
  }

  #cleanUpSourceArray(array: T[], from: 'TOP' | 'BOTTOM') {
    const { maxLength } = this.#config;
    const arr = [...array];
    if (arr.length > maxLength) {
      if (from === 'TOP') {
        arr.splice(0, array.length - maxLength);
      } else {
        arr.splice(maxLength);
      }
    }
    return arr;
  }

  #getCombinedSortedArray(newItems: T[]) {
    const { keyExtractor, sorter } = this.#config;

    const sourceArray = this.array.filter((item) => item !== null) as T[];

    // merge arrays based on key
    const sourceMap = new Map(
      sourceArray.map((item) => [keyExtractor(item), item])
    );
    const newMap = new Map(newItems.map((item) => [keyExtractor(item), item]));

    const keys = Array.from(new Set([...sourceMap.keys(), ...newMap.keys()]));

    const newArray: T[] = [];
    keys.forEach((key) => {
      if (sourceMap.has(key)) {
        newArray.push(sourceMap.get(key)!);
      } else {
        newArray.push(newMap.get(key)!);
      }
    });

    newArray.sort(sorter);

    return newArray;
  }
}
