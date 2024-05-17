# DynamicArray

DynamicArray is a TypeScript utility for managing dynamic arrays with configurable focus, sorting, and key extraction. It provides methods to append items while maintaining the focus on a specific index. This package is designed to handle large arrays efficiently by reserving space and managing the array length dynamically.

## Installation

You can install the package using npm:

```bash
npm install dynamic-array
```
```bash
yarn add dynamic-array
```


## Usage

### Importing the DynamicArray class

```typescript
import { DynamicArray } from 'dynamic-array';
```

### Creating a DynamicArray instance

```typescript
const dynamicArray = new DynamicArray<number>({
  reservedSize: 100,
  maxLength: 50,
  initialFocusIndex: 25,
  onFocusedIndexChange: (index, lastIndex) => {
    console.log(`Focus moved from ${lastIndex} to ${index}`);
  },
  sorter: (a, b) => a - b,
  keyExtractor: (item) => item.toString(),
});
```

### Configuring the DynamicArray

#### Options

- `reservedSize`: Total size of the reserved array. This creates a very large array filled with `null` items initially.
- `maxLength`: Maximum length of the array after adding new items. Ensures that the number of items with data never exceeds this limit, helping to save memory and avoid memory leaks.
- `initialFocusIndex`: Index to focus on initially.
- `onFocusedIndexChange`: Callback function invoked when the focus index changes.
- `sorter`: Function to sort the items in the array.
- `keyExtractor`: Function to extract the key from an item.

### Methods

#### append(newItems: T[], newFocusedIndex?: number)

Appends new items to the array and optionally updates the focused index. The number of items with data will not exceed `maxLength`.

```typescript
dynamicArray.append([100, 101, 102]);
```

#### setFocusedIndex(index: number)

Sets the focused index.

```typescript
dynamicArray.setFocusedIndex(10);
```

### Example

When you define `reservedSize` as 10000 and `maxLength` as 500, and append items to your DynamicArray, the number of items with data will never exceed 500. This is helpful for saving memory and avoiding memory leaks. When you append items, the positions (index) of previous items remain the same as before unless the index of items is affected by sorting.

```typescript
const dynamicArray = new DynamicArray<number>({
  reservedSize: 10000,
  maxLength: 500,
  initialFocusIndex: 5000,
  sorter: (a, b) => a - b,
  keyExtractor: (item) => item.toString(),
});

dynamicArray.append([6000, 6001, 6002]);
console.log(dynamicArray.array); // Large array with max 500 data items, rest are null
```

### Memory Usage

If you define `reservedSize` as 1,000,000, the reserved memory for `DynamicArray` will be approximately 3.81 MB. This estimation is based on each `null` value occupying 4 bytes of memory.

Here is a table illustrating the memory usage for different `reservedSize` values:

| Reserved Size | Memory Usage (MB) |
|---------------|-------------------|
| 1,000         | 0.0038            |
| 10,000        | 0.038             |
| 100,000       | 0.381             |
| 1,000,000     | 3.81              |
| 10,000,000    | 38.1              |

```typescript
const dynamicArray = new DynamicArray<number>({
  reservedSize: 1_000_000,
  maxLength: 500,
  initialFocusIndex: 500_000,
  sorter: (a, b) => a - b,
  keyExtractor: (item) => item.toString(),
});

console.log(dynamicArray.array.length); // 1,000,000
```

## Tests

The package includes tests to ensure the correct functionality of the DynamicArray class. You can run the tests using Jest.

### Running Tests

```bash
npm test
```

## License

This project is licensed under the MIT License.
