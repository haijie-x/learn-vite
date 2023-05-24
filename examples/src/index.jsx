/* eslint-disable no-undef */
const { useState } = React

function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h1>Hello React 18!</h1>
      <p>Count: {count}</p>

      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
