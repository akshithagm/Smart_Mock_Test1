/**
 * Smart Mock Test – Dynamic Quiz Application
 * Question Bank: 10 Rigorous, Industry-grade questions across CS, Python, AI & Technology
 */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: "Python Core",
    difficulty: "Medium",
    question: "What will be the output of the following Python code snippet?",
    codeSnippet: `def add_item(item, item_list=[]):
    item_list.append(item)
    return item_list

print(add_item('A'))
print(add_item('B'))`,
    options: [
      "['A'] then ['B']",
      "['A'] then ['A', 'B']",
      "['A', 'B'] then ['A', 'B']",
      "TypeError: default parameter cannot be mutable"
    ],
    correctAnswer: 1, // 0-indexed: B
    explanation: "In Python, default parameter values are evaluated once when the function definition is executed, not each time the function is called. Therefore, the same mutable list `item_list` is retained and reused across consecutive invocations."
  },
  {
    id: 2,
    category: "Artificial Intelligence",
    difficulty: "Medium",
    question: "Which mechanism in the Transformer architecture allows the model to dynamically weight the importance of different tokens in an input sequence regardless of their positional distance?",
    codeSnippet: null,
    options: [
      "Backpropagation through time (BPTT)",
      "Multi-Head Self-Attention",
      "Convolutional Feature Pooling",
      "Max-Margin Discriminant Analysis"
    ],
    correctAnswer: 1,
    explanation: "The Multi-Head Self-Attention mechanism computes alignment scores between Query, Key, and Value vectors for all tokens in parallel, enabling the model to capture long-range contextual relationships without recurrent steps."
  },
  {
    id: 3,
    category: "Data Structures & Algorithms",
    difficulty: "Easy",
    question: "What is the worst-case time complexity of searching for an element in an AVL Tree containing n nodes?",
    codeSnippet: null,
    options: [
      "O(1)",
      "O(n)",
      "O(log n)",
      "O(n log n)"
    ],
    correctAnswer: 2,
    explanation: "An AVL tree is a strictly self-balancing binary search tree where the height difference between left and right subtrees is at most 1. The maximum height is strictly bounded by ~1.44 log2(n), guaranteeing O(log n) lookup in the worst case."
  },
  {
    id: 4,
    category: "Computer Networks",
    difficulty: "Medium",
    question: "During the establishment of a standard TCP connection (Three-Way Handshake), what sequence of flags is exchanged between Client and Server?",
    codeSnippet: null,
    options: [
      "SYN -> SYN-ACK -> ACK",
      "ACK -> SYN -> ACK-SYN",
      "SYN -> ACK -> DATA",
      "RST -> SYN -> FIN"
    ],
    correctAnswer: 0,
    explanation: "The TCP 3-way handshake begins with the client sending a SYN segment. The server responds with SYN-ACK to acknowledge receipt and synchronize its own sequence number. Finally, the client replies with ACK to establish the connection."
  },
  {
    id: 5,
    category: "Machine Learning",
    difficulty: "Hard",
    question: "When a deep neural network achieves 99.8% accuracy on training data but drops to 62.4% on unseen validation data, which phenomenon and remediation strategy is most appropriate?",
    codeSnippet: null,
    options: [
      "High bias (Underfitting); Remediation: Reduce network capacity and remove layers",
      "High variance (Overfitting); Remediation: Apply Dropout, L2 Regularization, or Data Augmentation",
      "Data Drift; Remediation: Switch activation functions from ReLU to Sigmoid",
      "Gradient Explosion; Remediation: Increase the learning rate by a factor of 10"
    ],
    correctAnswer: 1,
    explanation: "A high training accuracy coupled with substantially lower validation accuracy is the textbook manifestation of Overfitting (High Variance). Remediation includes Dropout, L1/L2 weight decay, early stopping, and augmenting the training dataset."
  },
  {
    id: 6,
    category: "Operating Systems",
    difficulty: "Medium",
    question: "Which of the following is NOT one of the four necessary Coffman conditions required for a system deadlock to occur?",
    codeSnippet: null,
    options: [
      "Mutual Exclusion",
      "Hold and Wait",
      "Preemption by Priority Scheduler",
      "Circular Wait"
    ],
    correctAnswer: 2,
    explanation: "The four Coffman conditions are: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption (resources cannot be forcibly taken away), and (4) Circular Wait. Preemption by priority scheduler actually breaks deadlock, not causes it."
  },
  {
    id: 7,
    category: "Database Systems",
    difficulty: "Medium",
    question: "In relational database transactions, which ACID property guarantees that intermediate states of a transaction remain invisible to concurrently executing transactions?",
    codeSnippet: null,
    options: [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability"
    ],
    correctAnswer: 2,
    explanation: "Isolation ensures that concurrent execution of transactions leaves the database in the same state as if they were executed sequentially. Intermediate uncommitted changes are shielded according to the transaction isolation level."
  },
  {
    id: 8,
    category: "Python Core",
    difficulty: "Easy",
    question: "What is the result of evaluating the following Python expression?",
    codeSnippet: `result = [x * 2 for x in range(6) if x % 2 != 0]
print(result)`,
    options: [
      "[0, 4, 8]",
      "[2, 6, 10]",
      "[1, 3, 5]",
      "[2, 4, 6]"
    ],
    correctAnswer: 1,
    explanation: "`range(6)` produces values 0, 1, 2, 3, 4, 5. The condition `x % 2 != 0` filters for odd numbers: 1, 3, 5. The expression `x * 2` transforms these into 2, 6, 10. Thus, the resulting list is `[2, 6, 10]`."
  },
  {
    id: 9,
    category: "Cryptography & Security",
    difficulty: "Medium",
    question: "In asymmetric public-key cryptography (such as RSA), if Alice wants to send a confidential encrypted message to Bob that only Bob can read, whose key must she use to encrypt the plaintext?",
    codeSnippet: null,
    options: [
      "Alice's Private Key",
      "Alice's Public Key",
      "Bob's Public Key",
      "Bob's Private Key"
    ],
    correctAnswer: 2,
    explanation: "For confidentiality, the sender (Alice) encrypts the plaintext with the recipient's (Bob's) Public Key. Bob is then the sole possessor of the corresponding Private Key necessary to decrypt the ciphertext."
  },
  {
    id: 10,
    category: "Artificial Intelligence",
    difficulty: "Medium",
    question: "Which loss function is standardly utilized for multi-class classification problems where the neural network's final layer utilizes a Softmax activation?",
    codeSnippet: null,
    options: [
      "Categorical Cross-Entropy Loss",
      "Mean Squared Error (MSE)",
      "Binary Hinge Loss",
      "Cosine Proximity Loss"
    ],
    correctAnswer: 0,
    explanation: "Categorical Cross-Entropy measures the dissimilarity between true one-hot probability distributions and the predicted probability distribution output by the Softmax function, penalizing divergent probabilities logarithmically."
  }
];
