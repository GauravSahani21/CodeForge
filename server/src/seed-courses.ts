import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.model';
import User from './models/User.model';
dotenv.config();

const COURSES = [
  {
    title: 'Mastering Data Structures',
    slug: 'mastering-data-structures',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop',
    description: 'A comprehensive guide to fundamental data structures. Learn how to store and organize data efficiently.',
    difficulty: 'Easy',
    tags: ['Data Structures', 'Basics'],
    isPublished: true,
    lessons: [
      {
        title: 'Introduction to Arrays',
        content: '## Arrays\nAn array is a collection of items stored at contiguous memory locations. It is the most basic data structure.\n\n### Key Operations:\n- **Access**: O(1)\n- **Search**: O(n)\n- **Insertion**: O(n)\n- **Deletion**: O(n)',
        codeExample: 'arr = [1, 2, 3, 4]\nprint(arr[0]) # Output: 1',
        quiz: [{ question: 'What is the time complexity of accessing an element in an array?', options: ['O(1)', 'O(n)', 'O(log n)'], answer: 0 }]
      },
      {
        title: 'Linked Lists Explained',
        content: '## Linked Lists\nA linked list is a linear data structure where elements are not stored at contiguous memory locations. Instead, each element (node) points to the next.\n\n### Types:\n1. **Singly Linked List**: Each node points to the next.\n2. **Doubly Linked List**: Each node points to both next and previous nodes.\n3. **Circular Linked List**: The last node points back to the first.',
        codeExample: 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None',
        quiz: [{ question: 'Which linked list node points to both directions?', options: ['Singly', 'Doubly', 'Circular'], answer: 1 }]
      },
      {
        title: 'Stacks and Queues',
        content: '## Stacks (LIFO)\nLast-In, First-Out. Imagine a stack of plates.\n- **Push**: Add to top\n- **Pop**: Remove from top\n\n## Queues (FIFO)\nFirst-In, First-Out. Imagine a line at a store.\n- **Enqueue**: Add to back\n- **Dequeue**: Remove from front',
        codeExample: 'stack = []\nstack.append(1) # Push\nstack.pop() # Pop\n\nfrom collections import deque\nqueue = deque([])\nqueue.append(1) # Enqueue\nqueue.popleft() # Dequeue',
        quiz: [{ question: 'Which principle does a Queue follow?', options: ['LIFO', 'FIFO', 'Random'], answer: 1 }]
      }
    ]
  },
  {
    title: 'Algorithms 101',
    slug: 'algorithms-101',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop',
    description: 'Learn the most common algorithms used in competitive programming and technical interviews.',
    difficulty: 'Medium',
    tags: ['Algorithms', 'Sorting', 'Searching'],
    isPublished: true,
    lessons: [
      {
        title: 'Binary Search Mastery',
        content: '## Binary Search\nBinary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item.\n\n### Prerequisites:\n- The array **MUST** be sorted.',
        codeExample: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1',
        quiz: [{ question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(1)'], answer: 1 }]
      },
      {
        title: 'Bubble vs Quick Sort',
        content: '## Sorting Algorithms\n\n### Bubble Sort\nA simple but slow (O(n²)) algorithm that repeatedly steps through the list.\n\n### Quick Sort\nA highly efficient (O(n log n) average) divide-and-conquer algorithm.',
        codeExample: '# Quick Sort Partition\ndef partition(arr, low, high):\n    pivot = arr[high]\n    i = low - 1\n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i+1], arr[high] = arr[high], arr[i+1]\n    return i + 1',
        quiz: [{ question: 'What is the average time complexity of Quick Sort?', options: ['O(n²)', 'O(n log n)', 'O(n)'], answer: 1 }]
      }
    ]
  },
  {
    title: 'Python for Competitive Programming',
    slug: 'python-for-cp',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop',
    description: 'Master Python-specific tricks, libraries, and optimizations to solve coding problems faster.',
    difficulty: 'Easy',
    tags: ['Python', 'Language'],
    isPublished: true,
    lessons: [
      {
        title: 'List Comprehensions & Slicing',
        content: '## Pythonic Code\nPython offers powerful tools to write concise code.\n\n### List Comprehension:\n`[x*x for x in range(10) if x % 2 == 0]`\n\n### Slicing:\n`arr[::-1]` reverses the list.',
        codeExample: 'squares = [i**2 for i in range(5)]\nreversed_str = "hello"[::-1]',
        quiz: [{ question: 'What does s[::-1] do in Python?', options: ['Copy string', 'Reverse string', 'Empty string'], answer: 1 }]
      },
      {
        title: 'Collections and Math Module',
        content: '## Standard Libraries\n- `collections.Counter`: Count frequencies easily.\n- `collections.deque`: Efficient double-ended queue.\n- `heapq`: Min-priority queue.\n- `math.gcd`: Greatest common divisor.',
        codeExample: 'from collections import Counter\nc = Counter("aaabbc")\nprint(c["a"]) # Output: 3',
        quiz: [{ question: 'Which module provides a priority queue in Python?', options: ['collections', 'heapq', 'math'], answer: 1 }]
      }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('No admin user found to associate with courses. Please run main seed first.');
    process.exit(1);
  }

  for (const c of COURSES) {
    await Course.findOneAndUpdate(
      { slug: c.slug },
      { ...c, createdBy: admin._id },
      { upsert: true, new: true }
    );
    console.log(`Upserted Course: ${c.title}`);
  }

  await mongoose.disconnect();
  console.log('Course Seeding Done!');
}

seed().catch(console.error);
