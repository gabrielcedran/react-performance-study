import { memo, useMemo } from "react";
import { List, ListRowRenderer } from "react-virtualized";
import { ProductItem } from "./ProductItem";

type SearchResultsProps = {
    results: Array<{
        id: number;
        price: number;
        title: string;
    }>,
    onAddToWishList: (id: number) => void;

}

function SearchResultsComponent({results, onAddToWishList}: SearchResultsProps) {

    const totalPrice = useMemo(() => { 
            return results.reduce((accumulator, product) => {
            return accumulator + product.price
        }, 0)
    }, [results])

    const rowRenderer: ListRowRenderer = ({index, key, style}) => {
        return (
            <div key={key} style={style}>
                <ProductItem 
                    product={results[index]} 
                    onAddToWishList={onAddToWishList} 
                />
            </div>
        )
    }

    return (
        <div>
            <h2>{totalPrice}</h2>

            <List 
                height={300}
                rowHeight={30}
                width={900}
                overscanRowCount={5}
                rowCount={results.length}
                rowRenderer={rowRenderer}
            />

            <hr/>

            {results.map(product => {
                return (
                    <ProductItem 
                        key={product.id} 
                        product={product} 
                        onAddToWishList={onAddToWishList}
                    />
                );
            })}
        </div>
    )
}

export const SearchResults = memo(SearchResultsComponent, (prevProps, nextProps) => {
    return Object.is(prevProps.results, nextProps.results);
});
