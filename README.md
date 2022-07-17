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

useCallback is used to memoise a function as whole (in comparison, useMemo memoise the function's result instead) and ensure its memory reference does not change.

Like variables, functions are recreated `every time` a component rerenders. If functions are being passed down to children components (props drilling), those children components
will trigger a rerender cycle as the function's reference will have changed (referential equality).


Example:
```
  const addToWishList = useCallback((id: number) => {
    console.log(id);
  }, []); // the second parameter is the dependency array - when this function must be rerendered.
```

useCallback is extremelly useful for contexts to prevent users from rerendering unnecessarily.


*Special attention needs to be paid to `closure`. In case external variables (outside the function's scope) change but the memoised function is not changed, it will be operating with stale data.*


p.s useCallback has nothing to do with function's performance (prevent heavy function from being re-executed unnecessarily). It has all to do with `referential equality` that is the main mechanism
react uses to assess components that need re-rendering.


### Data formatting

Even when performance is tweaked with memo / useMemo, there is still the cost of determining when they should be re-executed. 
In order to squeeze performance even more, whenever possible it is preferable to execute calculations and formattings where the data is being fetched, not when it is about to be displayed.

Example:

```
...
<SearchResults 
    results={results} 
    onAddToWishList={addToWishList}
/>
...

function SearchResultsComponent({results, onAddToWishList}: SearchResultsProps) {

    const totalPrice = useMemo(() => { 
            return results.reduce((accumulator, product) => {
            return accumulator + product.price
        }, 0)
    }, [results]) // the cost of determining if the data changed is still there.

    return (
        <div>
        </div>
    )
}
```

If the total was calculated where the data is fetched, (1) the cost of determing if the totalPrice needed to be recalculated wouldn't be necessary (2) the useMemo wouldn't be necessary at all
(3) the calculation would only happened when it was indeed necessary.

```
    async function handleSearch(event: FormEvent) {
        ...
        const response = await fetch(`http://localhost:3333/products?q=${search}`)
        const data = await response.json()
        
        const totalPrice = results.reduce((accumulator, product) => {
                return accumulator + product.price
            }, 0);


        setResults({totalPrice, data});
    }

    <SearchResults 
        results={results.data}
        totalPrice={results.totalPrice} 
        onAddToWishList={addToWishList}
    />
```

The same concept would apply to formatting - if inside the Search results for each item needed to be formatted with its relative currency and pattern.


### Dynamic Import (Code Splitting)

As known as Lazy Loading, dynamic import is a powerful tool to tweak performance and leaves elements to be loaded only when they are in fact going to be used - 
some parts of the application might be rarely used or used by just a very few users.

When dynamic import is being used, the build will slice lazy load components out of the main bundle file so that they can be loaded only when necessary.


Example:

```
const AddProductToWishList = dynamic<AddProductToWishListProps>(() => { // it is necessary to pass the generic so that typescript can assist with the props the component receives
    return import('./AddProductToWishList') 
    .then( // when there is no export default, it is necessary to choose which component to use
        mod => mod.AddProductToWishList
    )
})

...

<AddProductToWishList ... />
```

In a vanilla react app, it is just a matter of importing lazy from react (`import {lazy} from 'react'`) instead of dynamic. When using a framework with SSR capability, it
is important to use their implementation.


Ps: dynamic import works for virtually anything like css, functions, etc.

Example:

```
async function showFormattedDate() {
    const {format} = await import('date-fns'); // this import will only be executed when this function runs.

    format(...)
}

```

### Virtualization

When there is a massive number of elements to dispay on the ui (list, table, or any other structure) not only it is costly for react but it is also heavy for the browser.
In such situations, most of the users won't go though a fraction of the available data. 

To reduce the burden, it is possible to use the concept of virtualization. This concept allows to only add elements to the html (DOM) that are in fact visible on the screen / browser.

There are some libs that helps with the implementation of this concept - to avoid having to develop everything from scratch (or reinvent the wheel).

`yarn add react-virtualized`


Example:

```
import { List, ListRowRenderer } from "react-virtualized";

<List 
    height={300}
    rowHeight={30}
    width={900}
    overscanRowCount={5}
    rowCount={results.length}
    rowRenderer={rowRenderer}
/>

```


When it is not possible to predict the height of the list (because you want it to take the full height), use the `AutoSizer` component from the lib.


### Bundle Analyzer

Bundler analyzes help you to identify what might be causing the bundled file to end up too big.

Lodash is a very popular lib that provides a great variety of funcionalities. For the sake of example it will be used.

https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer

