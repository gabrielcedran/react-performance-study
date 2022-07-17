import { memo, useMemo } from "react";
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

    return (
        <div>
            <h2>{totalPrice}</h2>

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
