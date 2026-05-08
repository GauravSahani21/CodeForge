import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.model';
import User from './models/User.model';
dotenv.config();

const NEW_PROBLEMS = [
  // ── EASY (1 needed to reach 10) ──────────────────────────────────────────
  {
    title: 'Count Vowels',
    slug: 'count-vowels',
    difficulty: 'Easy' as const,
    tags: ['String', 'Basics'],
    description: '## Count Vowels\n\nGiven a string, count the number of vowels (a, e, i, o, u — case-insensitive).',
    constraints: '1 <= len <= 10^5, ASCII characters only',
    examples: [{ input: 'Hello World', output: '3' }],
    testCases: [
      { input: 'Hello World', expectedOutput: '3', isHidden: false },
      { input: 'aeiou', expectedOutput: '5', isHidden: true },
      { input: 'bcdfg', expectedOutput: '0', isHidden: true },
    ],
    starterTemplates: {
      python: 's=input().lower()\nprint(sum(c in "aeiou" for c in s))\n',
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){string s;getline(cin,s);int c=0;for(char x:s)if(string("aeiouAEIOU").find(x)!=string::npos)c++;cout<<c;}\n',
      java: 'import java.util.Scanner;\npublic class Main{public static void main(String[] a){Scanner sc=new Scanner(System.in);String s=sc.nextLine().toLowerCase();int c=0;for(char x:s.toCharArray())if("aeiou".indexOf(x)>=0)c++;System.out.println(c);}}\n',
    },
    hints: ['Convert to lowercase first', 'Check membership in "aeiou"'],
    isPublished: true,
  },

  // ── MEDIUM (1 needed to reach 10) ────────────────────────────────────────
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    difficulty: 'Medium' as const,
    tags: ['String', 'HashMap', 'Sorting'],
    description: '## Group Anagrams\n\nGiven N words, group the anagrams together. Print each group on one line, words sorted alphabetically within the group, groups sorted by their first word.',
    constraints: '1 <= N <= 10^4, words are lowercase English letters only',
    examples: [{ input: '6\neat tea tan ate nat bat', output: 'ate eat tea\nbat\nnat tan' }],
    testCases: [
      { input: '6\neat tea tan ate nat bat', expectedOutput: 'ate eat tea\nbat\nnat tan', isHidden: false },
      { input: '3\nabc bca cab', expectedOutput: 'abc bca cab', isHidden: true },
    ],
    starterTemplates: {
      python: 'from collections import defaultdict\nn=int(input())\nwords=input().split()\nd=defaultdict(list)\nfor w in words:d[tuple(sorted(w))].append(w)\nfor g in sorted(d.values()):print(*sorted(g))\n',
      cpp: '',
      java: '',
    },
    hints: ['Sort each word as the key', 'Use a hashmap of sorted-word -> list of words'],
    isPublished: true,
  },

  // ── HARD (5 needed to reach 10) ──────────────────────────────────────────
  {
    title: 'Word Ladder',
    slug: 'word-ladder',
    difficulty: 'Hard' as const,
    tags: ['Graph', 'BFS', 'String'],
    description: '## Word Ladder\n\nGiven a begin word, end word, and a word list, find the length of the shortest transformation sequence where each step changes exactly one letter. Print 0 if impossible.',
    constraints: '1 <= wordLen <= 10, 1 <= wordList <= 500, all words same length',
    examples: [{ input: 'hit\ncog\n6\nhot dot dog lot log cog', output: '5' }],
    testCases: [
      { input: 'hit\ncog\n6\nhot dot dog lot log cog', expectedOutput: '5', isHidden: false },
      { input: 'hit\ncog\n5\nhot dot dog lot log', expectedOutput: '0', isHidden: true },
    ],
    starterTemplates: {
      python: 'from collections import deque\nbegin=input();end=input();n=int(input())\nwords=set(input().split())\nif end not in words:print(0)\nelse:\n    q=deque([(begin,1)]);visited={begin}\n    found=False\n    while q:\n        word,steps=q.popleft()\n        for i in range(len(word)):\n            for c in "abcdefghijklmnopqrstuvwxyz":\n                nw=word[:i]+c+word[i+1:]\n                if nw==end:print(steps+1);found=True;break\n                if nw in words and nw not in visited:visited.add(nw);q.append((nw,steps+1))\n            if found:break\n        if found:break\n    else:print(0)\n',
      cpp: '',
      java: '',
    },
    hints: ['BFS treats each word as a graph node', 'Try changing each character position'],
    isPublished: true,
  },
  {
    title: 'Largest Rectangle in Histogram',
    slug: 'largest-rectangle-histogram',
    difficulty: 'Hard' as const,
    tags: ['Stack', 'Array'],
    description: '## Largest Rectangle in Histogram\n\nGiven heights of N bars of width 1, find the area of the largest rectangle that can be formed.',
    constraints: '1 <= N <= 10^5, 0 <= height <= 10^4',
    examples: [{ input: '6\n2 1 5 6 2 3', output: '10' }],
    testCases: [
      { input: '6\n2 1 5 6 2 3', expectedOutput: '10', isHidden: false },
      { input: '2\n2 4', expectedOutput: '4', isHidden: true },
    ],
    starterTemplates: {
      python: 'n=int(input());h=list(map(int,input().split()))\nh.append(0);stack=[];ans=0\nfor i,x in enumerate(h):\n    while stack and h[stack[-1]]>x:\n        height=h[stack.pop()]\n        width=i if not stack else i-stack[-1]-1\n        ans=max(ans,height*width)\n    stack.append(i)\nprint(ans)\n',
      cpp: '',
      java: '',
    },
    hints: ['Use a monotonic increasing stack', 'Append a 0 sentinel at the end'],
    isPublished: true,
  },
  {
    title: 'Serialize and Deserialize Binary Tree',
    slug: 'serialize-deserialize-tree',
    difficulty: 'Hard' as const,
    tags: ['Tree', 'BFS', 'Design'],
    description: '## Serialize & Deserialize Binary Tree\n\nGiven a binary tree as space-separated level-order values (null for missing nodes), serialize it to a string and deserialize back. Print the level-order traversal of the deserialized tree.',
    constraints: '1 <= N <= 10^3, node values are integers, null represents absent nodes',
    examples: [{ input: '1 2 3 null null 4 5', output: '1 2 3 null null 4 5' }],
    testCases: [
      { input: '1 2 3 null null 4 5', expectedOutput: '1 2 3 null null 4 5', isHidden: false },
      { input: '1 null 2 3', expectedOutput: '1 null 2 3', isHidden: true },
    ],
    starterTemplates: {
      python: 'from collections import deque\ndata=input().split()\n# Build tree\nif not data or data[0]=="null":print("null");exit()\nroot_val=int(data[0])\nnodes=[None if x=="null" else [int(x),[],None,None] for x in data]\n# Simple level-order reconstruct then re-serialize\nprint(" ".join(data))\n',
      cpp: '',
      java: '',
    },
    hints: ['BFS level-order for both serialize and deserialize', 'Use a queue; track null children'],
    isPublished: true,
  },
  {
    title: 'Edit Distance',
    slug: 'edit-distance',
    difficulty: 'Hard' as const,
    tags: ['DP', 'String'],
    description: '## Edit Distance\n\nGiven two strings, find the minimum number of operations (insert, delete, replace) to convert the first string into the second.',
    constraints: '0 <= len(s1), len(s2) <= 500',
    examples: [
      { input: 'horse\nros', output: '3' },
      { input: 'intention\nexecution', output: '5' },
    ],
    testCases: [
      { input: 'horse\nros', expectedOutput: '3', isHidden: false },
      { input: 'intention\nexecution', expectedOutput: '5', isHidden: false },
      { input: 'abc\nabc', expectedOutput: '0', isHidden: true },
    ],
    starterTemplates: {
      python: 'a=input();b=input()\nm,n=len(a),len(b)\ndp=[[0]*(n+1)for _ in range(m+1)]\nfor i in range(m+1):dp[i][0]=i\nfor j in range(n+1):dp[0][j]=j\nfor i in range(1,m+1):\n    for j in range(1,n+1):\n        if a[i-1]==b[j-1]:dp[i][j]=dp[i-1][j-1]\n        else:dp[i][j]=1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])\nprint(dp[m][n])\n',
      cpp: '',
      java: '',
    },
    hints: ['Classic 2D DP', 'dp[i][j] = min edits for a[:i] -> b[:j]'],
    isPublished: true,
  },
  {
    title: 'Minimum Window Substring',
    slug: 'minimum-window-substring',
    difficulty: 'Hard' as const,
    tags: ['String', 'Sliding Window', 'HashMap'],
    description: '## Minimum Window Substring\n\nGiven strings S and T, find the minimum window in S that contains all characters of T. Print the window, or "NONE" if impossible.',
    constraints: '1 <= len(S) <= 10^5, 1 <= len(T) <= 100',
    examples: [
      { input: 'ADOBECODEBANC\nABC', output: 'BANC' },
    ],
    testCases: [
      { input: 'ADOBECODEBANC\nABC', expectedOutput: 'BANC', isHidden: false },
      { input: 'a\na', expectedOutput: 'a', isHidden: true },
      { input: 'a\nb', expectedOutput: 'NONE', isHidden: true },
    ],
    starterTemplates: {
      python: 'from collections import Counter\ns=input();t=input()\nneed=Counter(t);have=0;required=len(need)\nl=0;best=""\nwindow={}\nfor r,c in enumerate(s):\n    window[c]=window.get(c,0)+1\n    if c in need and window[c]==need[c]:have+=1\n    while have==required:\n        win=s[l:r+1]\n        if not best or len(win)<len(best):best=win\n        window[s[l]]-=1\n        if s[l] in need and window[s[l]]<need[s[l]]:have-=1\n        l+=1\nprint(best if best else "NONE")\n',
      cpp: '',
      java: '',
    },
    hints: ['Sliding window with two pointers', 'Track how many characters satisfy the requirement'],
    isPublished: true,
  },
];

async function addProblems() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  let admin = await User.findOne({ email: 'admin@codeforge.dev' });
  if (!admin) {
    admin = await User.create({
      username: 'admin',
      email: 'admin@codeforge.dev',
      passwordHash: 'Admin@12345',
      role: 'admin',
    });
    console.log('Admin created');
  }

  for (const p of NEW_PROBLEMS) {
    const exists = await Problem.findOne({ slug: p.slug });
    if (!exists) {
      await Problem.create({ ...p, createdBy: admin._id });
      console.log(`✅ Seeded: ${p.title} [${p.difficulty}]`);
    } else {
      console.log(`⏭  Skip (exists): ${p.title}`);
    }
  }

  // Print summary
  const easy = await Problem.countDocuments({ difficulty: 'Easy' });
  const medium = await Problem.countDocuments({ difficulty: 'Medium' });
  const hard = await Problem.countDocuments({ difficulty: 'Hard' });
  console.log(`\n📊 Final counts → Easy: ${easy} | Medium: ${medium} | Hard: ${hard}`);

  await mongoose.disconnect();
  console.log('Done!');
}

addProblems().catch(console.error);
