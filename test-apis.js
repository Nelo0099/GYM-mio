// Test script to run in browser console to test database connectivity
// Run this on https://gym-lovat-nine.vercel.app/dashboard to test APIs

console.log('Testing APIs...')

// Test database status first
fetch('/api/admin/status')
  .then(res => {
    console.log('Status API status:', res.status)
    return res.json()
  })
  .then(data => {
    console.log('Database status:', data)
    if (data.tables.userProfiles === 0) {
      console.log('⚠️ New tables missing! Running migration...')
      return fetch('/api/admin/migrate', { method: 'POST' })
    }
  })
  .then(res => res?.json())
  .then(data => {
    if (data) console.log('Migration result:', data)
  })
  .catch(err => console.error('Status/Migration error:', err))

// Test workouts API
setTimeout(() => {
  fetch('/api/workouts')
    .then(res => {
      console.log('Workouts API status:', res.status)
      return res.json()
    })
    .then(data => console.log('Workouts data:', data))
    .catch(err => console.error('Workouts error:', err))
}, 1000)

// Test routines API
setTimeout(() => {
  fetch('/api/user/routines')
    .then(res => {
      console.log('Routines API status:', res.status)
      return res.json()
    })
    .then(data => console.log('Routines data:', data))
    .catch(err => console.error('Routines error:', err))
}, 2000)

// Test profile API
setTimeout(() => {
  fetch('/api/user/profile')
    .then(res => {
      console.log('Profile API status:', res.status)
      return res.json()
    })
    .then(data => console.log('Profile data:', data))
    .catch(err => console.error('Profile error:', err))
}, 3000)

// Test creating a workout
setTimeout(() => {
  fetch('/api/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Workout',
      description: 'Test description',
      exercises: [{
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        weight: 0
      }]
    })
  })
    .then(res => {
      console.log('Create workout status:', res.status)
      return res.json()
    })
    .then(data => console.log('Created workout:', data))
    .catch(err => console.error('Create workout error:', err))
}, 4000)

// Test creating an auto routine
setTimeout(() => {
  fetch('/api/user/routines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'auto'
    })
  })
    .then(res => {
      console.log('Create auto routine status:', res.status)
      return res.json()
    })
    .then(data => console.log('Created auto routine:', data))
    .catch(err => console.error('Create auto routine error:', err))
}, 5000)

console.log('Test sequence started. Check console for results...')