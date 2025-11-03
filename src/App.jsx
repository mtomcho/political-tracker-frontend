import { useState, useEffect } from 'react'
import axios from 'axios'
const API_URL = 'https://political-tracker-backend.onrender.com'

function App() {
  const [politicians, setPoliticians] = useState([])
  const [filteredPoliticians, setFilteredPoliticians] = useState([])
  const [selectedPolitician, setSelectedPolitician] = useState(null)
  const [votingRecord, setVotingRecord] = useState([])
  const [groupByState, setGroupByState] = useState(false)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterParty, setFilterParty] = useState('all')
  const [filterPosition, setFilterPosition] = useState('all')
  const [filterElectionYear, setFilterElectionYear] = useState('all')
  const [filterState, setFilterState] = useState('all')

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  useEffect(() => {
    axios.get(`${API_URL}/api/politicians`)
      .then(response => {
        setPoliticians(response.data.data)
        setFilteredPoliticians(response.data.data)
      })
      .catch(error => console.error('Error:', error))
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = politicians

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterParty !== 'all') {
      filtered = filtered.filter(p => p.party === filterParty)
    }

    if (filterPosition !== 'all') {
      filtered = filtered.filter(p => p.position.includes(filterPosition))
    }

    if (filterElectionYear !== 'all') {
      filtered = filtered.filter(p => p.election_year === parseInt(filterElectionYear))
    }

    if (filterState !== 'all') {
      filtered = filtered.filter(p => p.state === filterState)
    }

    setFilteredPoliticians(filtered)
  }, [searchTerm, filterParty, filterPosition, filterElectionYear, filterState, politicians])

  const viewVotingRecord = (politician) => {
    setSelectedPolitician(politician)
    axios.get(`${API_URL}/api/politicians/${politician.id}/votes`)
      .then(response => {
        setVotingRecord(response.data.data)
      })
      .catch(error => console.error('Error:', error))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterParty('all')
    setFilterPosition('all')
    setFilterElectionYear('all')
    setFilterState('all')
  }

  // Group politicians by state
  const groupedByState = {}
  if (groupByState) {
    filteredPoliticians.forEach(pol => {
      const state = pol.state || 'Unknown'
      if (!groupedByState[state]) {
        groupedByState[state] = []
      }
      groupedByState[state].push(pol)
    })
  }

  const upForElection2026 = filteredPoliticians.filter(p => p.election_year === 2026)

  const PoliticianCard = ({ pol }) => (
    <div style={{ 
      border: pol.election_year === 2026 ? '2px solid #ffc107' : '1px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      backgroundColor: pol.election_year === 2026 ? '#fffbf0' : 'white'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{pol.name}</h3>
      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>State:</strong> {pol.state || 'N/A'}</p>
      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Position:</strong> {pol.position}</p>
      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Party:</strong> {pol.party}</p>
      {pol.election_year && (
        <p style={{ margin: '5px 0', fontSize: '14px', color: pol.election_year === 2026 ? '#d97706' : 'inherit', fontWeight: pol.election_year === 2026 ? 'bold' : 'normal' }}>
          🗳️ Next election: {pol.election_year}
        </p>
      )}
      <button 
        onClick={() => viewVotingRecord(pol)}
        style={{ 
          marginTop: '10px',
          padding: '8px 16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          width: '100%',
          fontSize: '14px'
        }}
      >
        View Voting Record
      </button>
    </div>
  )

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🏛️ National Political Accountability Tracker</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Tracking {politicians.length} politicians across all 50 states
      </p>
      
      {selectedPolitician ? (
        // Voting Record View
        <div>
          <button 
            onClick={() => setSelectedPolitician(null)}
            style={{ 
              padding: '10px 20px', 
              marginBottom: '20px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            ← Back to All Politicians
          </button>
          
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{selectedPolitician.name}</h2>
            <p style={{ margin: '5px 0' }}><strong>State:</strong> {selectedPolitician.state}</p>
            <p style={{ margin: '5px 0' }}><strong>Position:</strong> {selectedPolitician.position}</p>
            <p style={{ margin: '5px 0' }}><strong>Party:</strong> {selectedPolitician.party}</p>
            {selectedPolitician.election_year && (
              <p style={{ margin: '5px 0' }}>🗳️ Next election: {selectedPolitician.election_year}</p>
            )}
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>📊 Voting Summary</h3>
            <p style={{ margin: '5px 0' }}>
              <strong>Total Votes Cast:</strong> {votingRecord.length}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Yes Votes:</strong> {votingRecord.filter(v => v.vote === 'Yes').length} ({votingRecord.length > 0 ? Math.round((votingRecord.filter(v => v.vote === 'Yes').length / votingRecord.length) * 100) : 0}%)
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>No Votes:</strong> {votingRecord.filter(v => v.vote === 'No').length} ({votingRecord.length > 0 ? Math.round((votingRecord.filter(v => v.vote === 'No').length / votingRecord.length) * 100) : 0}%)
            </p>
          </div>

          <h3>Voting Record ({votingRecord.length} votes)</h3>
          {votingRecord.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No voting records available for this politician.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {votingRecord.map((vote, index) => (
                <div key={index} style={{ 
                  border: '1px solid #ddd', 
                  padding: '20px', 
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
                        {vote.bill_number}
                      </h4>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#007bff' }}>
                        {vote.title}
                      </h3>
                    </div>
                    <div style={{ 
                      padding: '10px 20px', 
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      marginLeft: '20px',
                      fontSize: '16px',
                      backgroundColor: vote.vote === 'Yes' ? '#d4edda' : '#f8d7da',
                      color: vote.vote === 'Yes' ? '#155724' : '#721c24',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {vote.vote === 'Yes' ? '✓ VOTED YES' : '✗ VOTED NO'}
                    </div>
                  </div>
                  
                  {/* Bill Summary */}
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '6px',
                    borderLeft: '4px solid #007bff',
                    marginBottom: '15px'
                  }}>
                    <p style={{ 
                      margin: '0', 
                      fontSize: '16px', 
                      lineHeight: '1.6',
                      color: '#495057'
                    }}>
                      <strong>📋 What this bill does:</strong> {vote.description}
                    </p>
                  </div>

                  {/* Vote Rounds Info */}
                  {vote.vote_rounds > 1 && (
                    <div style={{ 
                      backgroundColor: '#fff3cd', 
                      padding: '10px', 
                      borderRadius: '6px',
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      <strong>🔄 Voting Process:</strong> This bill went through {vote.vote_rounds} rounds of voting before reaching its current status.
                    </div>
                  )}

                  {/* Pros */}
                  {vote.pros && (
                    <div style={{ 
                      backgroundColor: '#d4edda', 
                      padding: '12px', 
                      borderRadius: '6px',
                      marginBottom: '10px',
                      borderLeft: '4px solid #28a745'
                    }}>
                      <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.5' }}>
                        <strong>✅ Arguments For:</strong> {vote.pros}
                      </p>
                    </div>
                  )}

                  {/* Cons */}
                  {vote.cons && (
                    <div style={{ 
                      backgroundColor: '#f8d7da', 
                      padding: '12px', 
                      borderRadius: '6px',
                      marginBottom: '15px',
                      borderLeft: '4px solid #dc3545'
                    }}>
                      <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.5' }}>
                        <strong>❌ Arguments Against:</strong> {vote.cons}
                      </p>
                    </div>
                  )}

                  {/* Bill Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto auto', 
                    gap: '15px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <div>
                      <strong>📊 Status:</strong> 
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: vote.status === 'Passed' ? '#d4edda' : 
                                       vote.status === 'Failed' ? '#f8d7da' : '#fff3cd',
                        color: vote.status === 'Passed' ? '#155724' : 
                               vote.status === 'Failed' ? '#721c24' : '#856404'
                      }}>
                        {vote.status}
                      </span>
                    </div>
                    <div>
                      <strong>📅 Introduced:</strong> {new Date(vote.introduced_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {/* Impact */}
                  <div style={{ 
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <strong>💡 Impact:</strong> {
                      vote.bill_number.includes('Infrastructure') ? 'Affects roads, bridges, and broadband internet access nationwide' :
                      vote.bill_number.includes('Climate') ? 'Impacts environmental policy and green energy investments' :
                      vote.bill_number.includes('Healthcare') ? 'Changes healthcare costs and insurance coverage for millions' :
                      vote.bill_number.includes('Tax') ? 'Modifies tax rates and affects household income' :
                      vote.bill_number.includes('Education') ? 'Influences school funding and student loan programs' :
                      vote.bill_number.includes('Border') ? 'Affects immigration policy and border security measures' :
                      vote.bill_number.includes('Defense') ? 'Determines military spending and national security priorities' :
                      vote.bill_number.includes('Workers') ? 'Changes labor laws and worker protections' :
                      vote.bill_number.includes('Energy') ? 'Affects domestic energy production and prices' :
                      vote.bill_number.includes('For the People') ? 'Reforms voting rights and campaign finance laws' :
                      'Significant policy change affecting constituents'
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Politicians List View
        <>
          {/* Search and Filter Bar */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>🔍 Search & Filter</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
              {/* Search */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Search by Name
                </label>
                <input
                  type="text"
                  placeholder="Type politician name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* State Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  State
                </label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All States</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Party Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Party
                </label>
                <select
                  value={filterParty}
                  onChange={(e) => setFilterParty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Parties</option>
                  <option value="Democrat">Democrat</option>
                  <option value="Republican">Republican</option>
                  <option value="Independent">Independent</option>
                  <option value="Nonpartisan">Nonpartisan</option>
                </select>
              </div>

              {/* Position Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Position Type
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Positions</option>
                  <option value="U.S. Senator">U.S. Senators</option>
                  <option value="U.S. Representative">U.S. Representatives</option>
                  <option value="Governor">Governors</option>
                </select>
              </div>

              {/* Election Year Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Election Year
                </label>
                <select
                  value={filterElectionYear}
                  onChange={(e) => setFilterElectionYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ margin: 0, color: '#666' }}>
                Showing <strong>{filteredPoliticians.length}</strong> of {politicians.length} politicians
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setGroupByState(!groupByState)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: groupByState ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {groupByState ? '📍 Grouped by State' : '📋 Group by State'}
                </button>
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Up for Election 2026 */}
          {!groupByState && upForElection2026.length > 0 && (
            <>
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>🗳️ Up for Election in 2026</h2>
                <p style={{ margin: 0, color: '#856404' }}>{upForElection2026.length} politicians</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                {upForElection2026.slice(0, 12).map(pol => <PoliticianCard key={pol.id} pol={pol} />)}
              </div>
              {upForElection2026.length > 12 && (
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                  ...and {upForElection2026.length - 12} more up for election in 2026
                </p>
              )}
            </>
          )}

          {/* Politicians Display */}
          {groupByState ? (
            // Grouped by State View
            <div>
              <h2>Politicians by State</h2>
              {Object.keys(groupedByState).sort().map(state => (
                <div key={state} style={{ marginBottom: '30px' }}>
                  <h3 style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    padding: '10px 15px', 
                    borderRadius: '6px',
                    marginBottom: '15px'
                  }}>
                    {state} ({groupedByState[state].length} politicians)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                    {groupedByState[state].map(pol => <PoliticianCard key={pol.id} pol={pol} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Regular Grid View
            <>
              <h2>All Politicians ({filteredPoliticians.length})</h2>
              {filteredPoliticians.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '40px', fontSize: '18px' }}>
                  No politicians match your search criteria. Try adjusting your filters!
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                  {filteredPoliticians.map(pol => <PoliticianCard key={pol.id} pol={pol} />)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
