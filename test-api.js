// Simple API test script
// Run with: node test-api.js (while dev server is running)

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  let token = '';
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    nickname: 'Test User'
  };

  try {
    // Test 1: Register
    console.log('1️⃣ Testing Registration...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    
    if (registerRes.ok) {
      console.log('✅ Registration successful');
      console.log('   User:', registerData.user.username);
      token = registerData.token;
    } else {
      console.log('❌ Registration failed:', registerData.error);
      return;
    }

    // Test 2: Login
    console.log('\n2️⃣ Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.ok) {
      console.log('✅ Login successful');
      token = loginData.token;
    } else {
      console.log('❌ Login failed:', loginData.error);
    }

    // Test 3: Get Current User
    console.log('\n3️⃣ Testing Get Current User...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    
    if (meRes.ok) {
      console.log('✅ Get user successful');
      console.log('   Email:', meData.user.email);
    } else {
      console.log('❌ Get user failed:', meData.error);
    }

    // Test 4: Create Journal Entry
    console.log('\n4️⃣ Testing Create Journal...');
    const journalRes = await fetch(`${BASE_URL}/journals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        mood: 'good',
        notes: 'Test journal entry'
      })
    });
    const journalData = await journalRes.json();
    
    if (journalRes.ok) {
      console.log('✅ Journal created successfully');
      console.log('   Mood:', journalData.journal.mood);
    } else {
      console.log('❌ Journal creation failed:', journalData.error);
    }

    // Test 5: Get All Journals
    console.log('\n5️⃣ Testing Get Journals...');
    const getJournalsRes = await fetch(`${BASE_URL}/journals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getJournalsData = await getJournalsRes.json();
    
    if (getJournalsRes.ok) {
      console.log('✅ Get journals successful');
      console.log('   Count:', getJournalsData.journals.length);
    } else {
      console.log('❌ Get journals failed:', getJournalsData.error);
    }

    // Test 6: Create Goal
    console.log('\n6️⃣ Testing Create Goal...');
    const goalRes = await fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Goal',
        description: 'This is a test goal',
        icon: '🎯',
        period: 'Daily'
      })
    });
    const goalData = await goalRes.json();
    
    if (goalRes.ok) {
      console.log('✅ Goal created successfully');
      console.log('   Title:', goalData.goal.title);
    } else {
      console.log('❌ Goal creation failed:', goalData.error);
    }

    // Test 7: Get All Goals
    console.log('\n7️⃣ Testing Get Goals...');
    const getGoalsRes = await fetch(`${BASE_URL}/goals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getGoalsData = await getGoalsRes.json();
    
    if (getGoalsRes.ok) {
      console.log('✅ Get goals successful');
      console.log('   Count:', getGoalsData.goals.length);
    } else {
      console.log('❌ Get goals failed:', getGoalsData.error);
    }

    // Test 8: Get Streak
    console.log('\n8️⃣ Testing Get Streak...');
    const streakRes = await fetch(`${BASE_URL}/streak`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const streakData = await streakRes.json();
    
    if (streakRes.ok) {
      console.log('✅ Get streak successful');
      console.log('   Current Streak:', streakData.streak.currentStreak);
      console.log('   Longest Streak:', streakData.streak.longestStreak);
    } else {
      console.log('❌ Get streak failed:', streakData.error);
    }

    // Test 9: Save Mood
    console.log('\n9️⃣ Testing Save Mood...');
    const moodRes = await fetch(`${BASE_URL}/moods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        mood: 'good'
      })
    });
    const moodData = await moodRes.json();
    
    if (moodRes.ok) {
      console.log('✅ Mood saved successfully');
      console.log('   Mood:', moodData.mood.mood);
    } else {
      console.log('❌ Mood save failed:', moodData.error);
    }

    // Test 10: Get Pet Settings
    console.log('\n🔟 Testing Get Pet Settings...');
    const petRes = await fetch(`${BASE_URL}/pet`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const petData = await petRes.json();
    
    if (petRes.ok) {
      console.log('✅ Get pet settings successful');
      console.log('   Pet Name:', petData.petSettings.petName);
      console.log('   Pet Level:', petData.petSettings.petLevel);
    } else {
      console.log('❌ Get pet settings failed:', petData.error);
    }

    console.log('\n✨ All tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n⚠️  Make sure the dev server is running: npm run dev\n');
  }
}

// Run tests
testAPI();
