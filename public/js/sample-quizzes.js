// =====================
// Sample Quizzes Data
// =====================

const sampleQuizzes = [
    {
        id: 'quiz-1',
        title: 'General Knowledge Challenge',
        description: 'Test your knowledge across various topics!',
        category: 'General Knowledge',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correctAnswer: 2
            },
            {
                question: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correctAnswer: 1
            },
            {
                question: 'Who painted the Mona Lisa?',
                options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
                correctAnswer: 2
            },
            {
                question: 'What is the largest ocean on Earth?',
                options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
                correctAnswer: 3
            },
            {
                question: 'In which year did World War II end?',
                options: ['1943', '1944', '1945', '1946'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-2',
        title: 'Science Fundamentals',
        description: 'Explore basic science concepts',
        category: 'Science',
        difficulty: 'Easy',
        timeLimit: 240,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the chemical symbol for water?',
                options: ['O2', 'H2O', 'CO2', 'NaCl'],
                correctAnswer: 1
            },
            {
                question: 'How many bones are in the adult human body?',
                options: ['186', '206', '226', '246'],
                correctAnswer: 1
            },
            {
                question: 'What force keeps us on the ground?',
                options: ['Magnetism', 'Friction', 'Gravity', 'Pressure'],
                correctAnswer: 2
            },
            {
                question: 'What is the center of an atom called?',
                options: ['Electron', 'Proton', 'Neutron', 'Nucleus'],
                correctAnswer: 3
            },
            {
                question: 'What gas do plants absorb from the atmosphere?',
                options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-3',
        title: 'World Geography',
        description: 'How well do you know our planet?',
        category: 'Geography',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the largest country by area?',
                options: ['Canada', 'China', 'USA', 'Russia'],
                correctAnswer: 3
            },
            {
                question: 'Which river is the longest in the world?',
                options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
                correctAnswer: 1
            },
            {
                question: 'Mount Everest is located in which mountain range?',
                options: ['Alps', 'Andes', 'Himalayas', 'Rockies'],
                correctAnswer: 2
            },
            {
                question: 'What is the smallest country in the world?',
                options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
                correctAnswer: 1
            },
            {
                question: 'Which continent has the most countries?',
                options: ['Asia', 'Europe', 'Africa', 'South America'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-4',
        title: 'Mathematics Mastery',
        description: 'Challenge your math skills!',
        category: 'Mathematics',
        difficulty: 'Hard',
        timeLimit: 360,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the value of Pi (π) to 2 decimal places?',
                options: ['3.12', '3.14', '3.16', '3.18'],
                correctAnswer: 1
            },
            {
                question: 'What is 15% of 200?',
                options: ['25', '30', '35', '40'],
                correctAnswer: 1
            },
            {
                question: 'What is the square root of 144?',
                options: ['10', '11', '12', '13'],
                correctAnswer: 2
            },
            {
                question: 'If a triangle has angles of 90° and 45°, what is the third angle?',
                options: ['30°', '45°', '60°', '90°'],
                correctAnswer: 1
            },
            {
                question: 'What is 8 × 7?',
                options: ['54', '56', '58', '60'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-5',
        title: 'Tech Trivia',
        description: 'Test your technology knowledge',
        category: 'Technology',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'Who founded Microsoft?',
                options: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Elon Musk'],
                correctAnswer: 1
            },
            {
                question: 'What does "HTTP" stand for?',
                options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Technical Protocol', 'High Tech Transfer Protocol'],
                correctAnswer: 0
            },
            {
                question: 'What year was the first iPhone released?',
                options: ['2005', '2006', '2007', '2008'],
                correctAnswer: 2
            },
            {
                question: 'What does "CPU" stand for?',
                options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Processor Utility', 'Computer Processing Unit'],
                correctAnswer: 0
            },
            {
                question: 'Which programming language is known as the "language of the web"?',
                options: ['Python', 'Java', 'JavaScript', 'C++'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-6',
        title: 'History Hub',
        description: 'Journey through time with history',
        category: 'History',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'Who was the first President of the United States?',
                options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
                correctAnswer: 1
            },
            {
                question: 'In which year did the Titanic sink?',
                options: ['1910', '1911', '1912', '1913'],
                correctAnswer: 2
            },
            {
                question: 'Who discovered America?',
                options: ['Christopher Columbus', 'Amerigo Vespucci', 'Leif Erikson', 'Ferdinand Magellan'],
                correctAnswer: 0
            },
            {
                question: 'What ancient wonder still stands today?',
                options: ['Hanging Gardens of Babylon', 'Great Pyramid of Giza', 'Colossus of Rhodes', 'Lighthouse of Alexandria'],
                correctAnswer: 1
            },
            {
                question: 'Who was known as the "Iron Lady"?',
                options: ['Indira Gandhi', 'Margaret Thatcher', 'Golda Meir', 'Angela Merkel'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-7',
        title: 'Sports Spectacular',
        description: 'Are you a sports enthusiast?',
        category: 'Sports',
        difficulty: 'Easy',
        timeLimit: 240,
        createdBy: 'admin',
        questions: [
            {
                question: 'How many players are on a soccer team?',
                options: ['9', '10', '11', '12'],
                correctAnswer: 2
            },
            {
                question: 'Which sport uses a shuttlecock?',
                options: ['Tennis', 'Badminton', 'Squash', 'Table Tennis'],
                correctAnswer: 1
            },
            {
                question: 'How many rings are in the Olympic logo?',
                options: ['4', '5', '6', '7'],
                correctAnswer: 1
            },
            {
                question: 'In basketball, how many points is a free throw worth?',
                options: ['1', '2', '3', '4'],
                correctAnswer: 0
            },
            {
                question: 'What color card does a referee use to eject a player in soccer?',
                options: ['Yellow', 'Red', 'Blue', 'Green'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-8',
        title: 'Movie Mania',
        description: 'How well do you know cinema?',
        category: 'Entertainment',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'Who directed "Jurassic Park"?',
                options: ['James Cameron', 'Steven Spielberg', 'George Lucas', 'Ridley Scott'],
                correctAnswer: 1
            },
            {
                question: 'Which movie won the first Academy Award for Best Picture?',
                options: ['Wings', 'Sunrise', 'The Jazz Singer', 'Metropolis'],
                correctAnswer: 0
            },
            {
                question: 'What is the highest-grossing film of all time?',
                options: ['Titanic', 'Avatar', 'Avengers: Endgame', 'Star Wars'],
                correctAnswer: 1
            },
            {
                question: 'Who played Iron Man in the Marvel movies?',
                options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'],
                correctAnswer: 2
            },
            {
                question: 'In which year was the first "Harry Potter" movie released?',
                options: ['1999', '2000', '2001', '2002'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-9',
        title: 'Animal Kingdom',
        description: 'Discover the world of animals',
        category: 'Nature',
        difficulty: 'Easy',
        timeLimit: 240,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the largest land animal?',
                options: ['Rhino', 'Hippo', 'Elephant', 'Giraffe'],
                correctAnswer: 2
            },
            {
                question: 'How many legs does a spider have?',
                options: ['6', '8', '10', '12'],
                correctAnswer: 1
            },
            {
                question: 'What is the fastest land animal?',
                options: ['Lion', 'Cheetah', 'Leopard', 'Tiger'],
                correctAnswer: 1
            },
            {
                question: 'Which animal is known as the "King of the Jungle"?',
                options: ['Tiger', 'Elephant', 'Lion', 'Gorilla'],
                correctAnswer: 2
            },
            {
                question: 'What do you call a baby kangaroo?',
                options: ['Cub', 'Pup', 'Joey', 'Kit'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-10',
        title: 'Music Masters',
        description: 'Test your music knowledge',
        category: 'Music',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'Who is known as the "King of Pop"?',
                options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'Madonna'],
                correctAnswer: 1
            },
            {
                question: 'Which band wrote "Bohemian Rhapsody"?',
                options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'],
                correctAnswer: 2
            },
            {
                question: 'How many strings does a standard guitar have?',
                options: ['4', '5', '6', '7'],
                correctAnswer: 2
            },
            {
                question: 'What is the highest female singing voice?',
                options: ['Alto', 'Soprano', 'Mezzo-soprano', 'Contralto'],
                correctAnswer: 1
            },
            {
                question: 'Which instrument has 88 keys?',
                options: ['Organ', 'Piano', 'Keyboard', 'Harpsichord'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-11',
        title: 'Space Exploration',
        description: 'Journey to the stars',
        category: 'Science',
        difficulty: 'Hard',
        timeLimit: 360,
        createdBy: 'admin',
        questions: [
            {
                question: 'How many planets are in our solar system?',
                options: ['7', '8', '9', '10'],
                correctAnswer: 1
            },
            {
                question: 'What is the closest star to Earth?',
                options: ['Proxima Centauri', 'Alpha Centauri', 'The Sun', 'Sirius'],
                correctAnswer: 2
            },
            {
                question: 'Who was the first person to walk on the moon?',
                options: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'John Glenn'],
                correctAnswer: 1
            },
            {
                question: 'What is the largest planet in our solar system?',
                options: ['Saturn', 'Neptune', 'Uranus', 'Jupiter'],
                correctAnswer: 3
            },
            {
                question: 'How long does it take for light from the Sun to reach Earth?',
                options: ['8 seconds', '8 minutes', '8 hours', '8 days'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-12',
        title: 'Food & Cuisine',
        description: 'Culinary knowledge test',
        category: 'Food',
        difficulty: 'Easy',
        timeLimit: 240,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the main ingredient in guacamole?',
                options: ['Tomato', 'Avocado', 'Pepper', 'Onion'],
                correctAnswer: 1
            },
            {
                question: 'Which country is famous for pizza?',
                options: ['France', 'Spain', 'Italy', 'Greece'],
                correctAnswer: 2
            },
            {
                question: 'What type of food is sushi?',
                options: ['Chinese', 'Korean', 'Japanese', 'Thai'],
                correctAnswer: 2
            },
            {
                question: 'What is the most popular drink in the world after water?',
                options: ['Coffee', 'Tea', 'Soda', 'Juice'],
                correctAnswer: 1
            },
            {
                question: 'Which fruit is known for having seeds on the outside?',
                options: ['Raspberry', 'Strawberry', 'Blackberry', 'Blueberry'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-13',
        title: 'Literature Legends',
        description: 'Test your book knowledge',
        category: 'Literature',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'Who wrote "Romeo and Juliet"?',
                options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
                correctAnswer: 1
            },
            {
                question: 'What is the first book of the Harry Potter series?',
                options: ['Chamber of Secrets', 'Prisoner of Azkaban', 'Philosopher\'s Stone', 'Goblet of Fire'],
                correctAnswer: 2
            },
            {
                question: 'Who wrote "To Kill a Mockingbird"?',
                options: ['Harper Lee', 'F. Scott Fitzgerald', 'Ernest Hemingway', 'John Steinbeck'],
                correctAnswer: 0
            },
            {
                question: 'What is the name of the wizard in "The Lord of the Rings"?',
                options: ['Saruman', 'Gandalf', 'Radagast', 'Merlin'],
                correctAnswer: 1
            },
            {
                question: 'Who wrote "1984"?',
                options: ['Aldous Huxley', 'Ray Bradbury', 'George Orwell', 'H.G. Wells'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-14',
        title: 'Art & Artists',
        description: 'Explore the world of art',
        category: 'Art',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'Who painted "The Starry Night"?',
                options: ['Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 'Salvador Dali'],
                correctAnswer: 1
            },
            {
                question: 'What art movement was Pablo Picasso associated with?',
                options: ['Impressionism', 'Cubism', 'Surrealism', 'Expressionism'],
                correctAnswer: 1
            },
            {
                question: 'Where is the Mona Lisa displayed?',
                options: ['The Louvre', 'The Met', 'The Uffizi', 'The Prado'],
                correctAnswer: 0
            },
            {
                question: 'Who sculpted "David"?',
                options: ['Donatello', 'Michelangelo', 'Bernini', 'Rodin'],
                correctAnswer: 1
            },
            {
                question: 'What is the primary color that cannot be made by mixing other colors?',
                options: ['Green', 'Orange', 'Red', 'Purple'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-15',
        title: 'World Capitals',
        description: 'Name the capital cities',
        category: 'Geography',
        difficulty: 'Easy',
        timeLimit: 240,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the capital of Japan?',
                options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
                correctAnswer: 2
            },
            {
                question: 'What is the capital of Australia?',
                options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
                correctAnswer: 2
            },
            {
                question: 'What is the capital of Canada?',
                options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
                correctAnswer: 3
            },
            {
                question: 'What is the capital of Egypt?',
                options: ['Alexandria', 'Cairo', 'Giza', 'Luxor'],
                correctAnswer: 1
            },
            {
                question: 'What is the capital of Brazil?',
                options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-16',
        title: 'Computer Science Basics',
        description: 'Programming fundamentals',
        category: 'Technology',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'What does "RAM" stand for?',
                options: ['Random Access Memory', 'Read Access Memory', 'Rapid Access Memory', 'Remote Access Memory'],
                correctAnswer: 0
            },
            {
                question: 'Which of these is a programming language?',
                options: ['HTML', 'CSS', 'Python', 'HTTP'],
                correctAnswer: 2
            },
            {
                question: 'What is the smallest unit of data in a computer?',
                options: ['Bit', 'Byte', 'Kilobyte', 'Megabyte'],
                correctAnswer: 0
            },
            {
                question: 'What does "URL" stand for?',
                options: ['Universal Resource Locator', 'Uniform Resource Locator', 'Universal Record Locator', 'Uniform Record Locator'],
                correctAnswer: 1
            },
            {
                question: 'Which company developed the Android operating system?',
                options: ['Apple', 'Microsoft', 'Google', 'Samsung'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-17',
        title: 'Chemistry Challenges',
        description: 'Test your chemistry knowledge',
        category: 'Science',
        difficulty: 'Hard',
        timeLimit: 360,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the chemical symbol for gold?',
                options: ['Go', 'Gd', 'Au', 'Ag'],
                correctAnswer: 2
            },
            {
                question: 'How many elements are in the periodic table?',
                options: ['108', '118', '128', '138'],
                correctAnswer: 1
            },
            {
                question: 'What is the most abundant gas in Earth\'s atmosphere?',
                options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
                correctAnswer: 2
            },
            {
                question: 'What is the pH of pure water?',
                options: ['5', '6', '7', '8'],
                correctAnswer: 2
            },
            {
                question: 'What is the atomic number of carbon?',
                options: ['4', '6', '8', '12'],
                correctAnswer: 1
            }
        ]
    },
    {
        id: 'quiz-18',
        title: 'Famous Landmarks',
        description: 'Identify world landmarks',
        category: 'Geography',
        difficulty: 'Easy',
        timeLimit: 240,
        createdBy: 'admin',
        questions: [
            {
                question: 'Where is the Eiffel Tower located?',
                options: ['London', 'Paris', 'Rome', 'Madrid'],
                correctAnswer: 1
            },
            {
                question: 'What country is the Great Wall in?',
                options: ['Japan', 'Korea', 'China', 'Vietnam'],
                correctAnswer: 2
            },
            {
                question: 'Where is the Statue of Liberty?',
                options: ['Boston', 'Philadelphia', 'Washington DC', 'New York'],
                correctAnswer: 3
            },
            {
                question: 'What country is the Taj Mahal in?',
                options: ['Pakistan', 'India', 'Bangladesh', 'Nepal'],
                correctAnswer: 1
            },
            {
                question: 'Where is Big Ben located?',
                options: ['London', 'Edinburgh', 'Dublin', 'Cardiff'],
                correctAnswer: 0
            }
        ]
    },
    {
        id: 'quiz-19',
        title: 'Business & Economics',
        description: 'Test your business knowledge',
        category: 'Business',
        difficulty: 'Medium',
        timeLimit: 300,
        createdBy: 'admin',
        questions: [
            {
                question: 'What does "CEO" stand for?',
                options: ['Chief Executive Officer', 'Chief Economic Officer', 'Central Executive Officer', 'Chief Enforcement Officer'],
                correctAnswer: 0
            },
            {
                question: 'What is the currency of the European Union?',
                options: ['Pound', 'Dollar', 'Euro', 'Franc'],
                correctAnswer: 2
            },
            {
                question: 'Who founded Tesla Motors?',
                options: ['Elon Musk', 'Jeff Bezos', 'Bill Gates', 'Steve Jobs'],
                correctAnswer: 0
            },
            {
                question: 'What does "GDP" stand for?',
                options: ['General Domestic Product', 'Gross Domestic Product', 'General Development Plan', 'Gross Development Plan'],
                correctAnswer: 1
            },
            {
                question: 'Which company is known for the "swoosh" logo?',
                options: ['Adidas', 'Puma', 'Nike', 'Reebok'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 'quiz-20',
        title: 'Ultimate Challenge',
        description: 'The toughest quiz of all!',
        category: 'Mixed',
        difficulty: 'Hard',
        timeLimit: 420,
        createdBy: 'admin',
        questions: [
            {
                question: 'What is the speed of light in meters per second?',
                options: ['299,792,458 m/s', '300,000,000 m/s', '299,000,000 m/s', '298,792,458 m/s'],
                correctAnswer: 0
            },
            {
                question: 'Who developed the theory of relativity?',
                options: ['Isaac Newton', 'Niels Bohr', 'Albert Einstein', 'Stephen Hawking'],
                correctAnswer: 2
            },
            {
                question: 'What is the smallest country by population?',
                options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'],
                correctAnswer: 2
            },
            {
                question: 'How many time zones does Russia have?',
                options: ['9', '10', '11', '12'],
                correctAnswer: 2
            },
            {
                question: 'What is the most spoken language in the world?',
                options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'],
                correctAnswer: 2
            },
            {
                question: 'In which year did the Berlin Wall fall?',
                options: ['1987', '1988', '1989', '1990'],
                correctAnswer: 2
            },
            {
                question: 'What is the hardest natural substance on Earth?',
                options: ['Diamond', 'Graphene', 'Titanium', 'Steel'],
                correctAnswer: 0
            },
            {
                question: 'How many chambers does a human heart have?',
                options: ['2', '3', '4', '5'],
                correctAnswer: 2
            }
        ]
    }
];

// Function to load sample quizzes into Firebase Firestore
async function loadSampleQuizzesToFirebase() {
    if (!window.isFirebaseReady || !window.isFirebaseReady()) {
        console.error('Firebase not ready. Cannot load sample quizzes.');
        return { success: false, message: 'Firebase not initialized' };
    }

    try {
        console.log('📚 Loading sample quizzes to Firebase...');
        let loadedCount = 0;

        for (const quiz of sampleQuizzes) {
            try {
                // Check if quiz already exists
                const quizDoc = await db.collection('quizzes').doc(quiz.id).get();
                
                if (!quizDoc.exists) {
                    // Add timestamp and default values
                    const quizData = {
                        ...quiz,
                        createdBy: 'system', // System-created quizzes
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        isPublic: true,
                        timer: 30 // 30 seconds per question
                    };
                    
                    await db.collection('quizzes').doc(quiz.id).set(quizData);
                    loadedCount++;
                    console.log(`✅ Loaded: ${quiz.title}`);
                }
            } catch (error) {
                console.error(`Error loading quiz ${quiz.id}:`, error);
            }
        }

        console.log(`🎉 Successfully loaded ${loadedCount} sample quizzes!`);
        return { success: true, count: loadedCount };
    } catch (error) {
        console.error('Error loading sample quizzes:', error);
        return { success: false, message: error.message };
    }
}

// Auto-load sample quizzes on first visit (Firebase version)
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        // Wait for Firebase to initialize
        if (window.firebaseConfigured) {
            // Check if we should load sample quizzes
            const samplesLoaded = localStorage.getItem('sampleQuizzesLoaded');
            
            if (!samplesLoaded) {
                // Wait a bit for Firebase to be fully ready
                setTimeout(async () => {
                    if (window.isFirebaseReady && window.isFirebaseReady()) {
                        console.log('🎯 First visit detected - loading sample quizzes...');
                        const result = await loadSampleQuizzesToFirebase();
                        
                        if (result.success) {
                            localStorage.setItem('sampleQuizzesLoaded', 'true');
                            console.log('✨ Sample quizzes are now available!');
                        }
                    }
                }, 2000); // Wait 2 seconds for Firebase to be ready
            }
        }
    });
}

// Function to manually reload sample quizzes (for testing)
window.reloadSampleQuizzes = async function() {
    localStorage.removeItem('sampleQuizzesLoaded');
    const result = await loadSampleQuizzesToFirebase();
    if (result.success) {
        alert(`✅ Loaded ${result.count} sample quizzes!`);
        window.location.reload();
    } else {
        alert(`❌ Error: ${result.message}`);
    }
};

// Old localStorage version (keep for backward compatibility)
function loadSampleQuizzes() {
    sampleQuizzes.forEach(quiz => {
        // Check if quiz already exists
        const existingQuiz = Database.getQuizById(quiz.id);
        if (!existingQuiz) {
            Database.saveQuiz(quiz);
        }
    });
    console.log('Sample quizzes loaded successfully!');
}

// Legacy auto-load (for pages not using Firebase)
if (typeof Database !== 'undefined') {
    const allQuizzes = Database.getAllQuizzes();
    if (allQuizzes.length === 0) {
        loadSampleQuizzes();
    }
}
