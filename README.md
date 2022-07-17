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


### memo

Memo helps us to instruct react to not verify changes on children components that we know that have not been changed - remember: by default every time 
a parent component is rerendered all its children component will also their rerender lifecycle triggered, even if they do not lead to DOM changes because... 
they haven't changed (and it wastes computing power).

In a nutshell, memo operates over the properties provided to the child component using a shallow comparison** ({} === {} will result in false - referential equality).

There are 2 ways to use the memo feature:

1. change the component to an arrow function and wrap it.

```
import { memo } from "react";

export const SearchResults = memo(({results}: SearchResultsProps) => {
    return (
        <div>
            ...
        </div>
    )
})
```

2. keep the component as a regular function but just wrap its export:

```
import { memo } from "react";

function SearchResultsComponent({results}: SearchResultsProps) {
    return (
        <div>
            ...
        </div>
    )
}

export const SearchResults = memo(SearchResultsComponent);
```

** Due to the shallow comparison, the memo might generate some unnecessary rerender cycles. Because of that, memo function receives a parameter where it allows
custom implementation of the comparison:

```
export const SearchResults = memo(SearchResultsComponent, (prevProps, nextProps) => {
    return Object.is(prevProps.results, nextProps.results); // Object.is performs a deep comparison, but it comes with a higher processing cost (especially depending on the objects sizes)
});

// it is down to the feature the most appropriate way of implementing the custom comparison
```

There is a tradeoff when taking the responsibility of comparision out of react's hands and bringing to ours. It might cause the application to become even slower depending on the custom
comparison. As a rule of thumb, memo is generally good on:

1. Pure Functional Components
2. Components that render too often
3. Components that rerender with the same props
4. Medium to super heavy components


It is a good practice to first run into performance issue to try and improve it rather than trying to tweak it preemptively


### useMemo

useMemo hook works somewhat similarly to memo. However it can memoise functions' `results`. It is particularly useful (and used) 
when there is a slow processing function and that function is re-executed every time the component is rerendered but the result does not change.

Unlike memo, useMemo receives a second parameter that signalises when the memoised result needs to be re-calculated (similar to useEffect).

Example:

```
import { useMemo } from "react";


function SearchResultsComponent({results}: SearchResultsProps) {

    const totalPrice = useMemo(() => { 
            return results.reduce((accumulator, product) => {
            return accumulator + product.price
        }, 0)
    }, [results])

    return (
        <div>
        ...
        </div>
    )
}
```

Besides preventing heavy functions from being executed every rerender cycle, another useful feature useMemo provides is referential equality.
This referential equality helps children component to avoid unnecessary rerender cycles.

```
function SearchResultsComponent({results}: SearchResultsProps) {

    const totalPriceMemoised = useMemo(() => { 
            return results.reduce((accumulator, product) => {
            return accumulator + product.price
            }, 0)
    }, [results])

    const totalPriceNotMemoised = results.reduce(
        (accumulator, product) => {
            return accumulator + product.price
        }, 0)

    return (
        <div>
            <ComponentOne totalPrice={totalPriceMemoised}/ >
            <ComponentTwo totalPrice={totalPriceNotMemoised}/ >
        </div>
    )
}
```

In the example above, ComponentOne will only rerender when in fact results change. ComponentTwo on the other hand will trigger a rerender every time SearchResultsComponent rerenders.


### useCallback


