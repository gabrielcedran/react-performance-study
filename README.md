## React Performance Study

### Concepts

React rerenders components in three main situations:

1. When a parent component rerenders, all its children components will be rerenders
2. When a component's props change
3. When a hook changes (useState, useReducer, useContext)


When react rerenders a component it does not mean that it will change the whole DOM tree. 
It first generates a virtual dom and then compares with the real dom. Then it `only` changes the elements elements that in fact changed.
It uses a diffing algorithm to identify what changed named reconciliation.


Even though react is optimised to be extremely efficient, there might be situation where performance tweaks are necessary and keeping the previous concepts in 
mind is extremely important.
