import dynamic from "next/dynamic";
import { useState } from "react";
import { AddProductToWishListProps } from "./AddProductToWishList";

const AddProductToWishList = dynamic<AddProductToWishListProps>(() => { // it is necessary to pass the generic so that typescript can assist with the props the component receives
    return import('./AddProductToWishList') 
    .then( // when there is no export default, it is necessary to choose which component to use
        mod => mod.AddProductToWishList
    )
}, {
    // this is not mandatory, but helps to build visual feedback for slow networks.
    loading: () => <span>carregando...</span>
})

type ProductItemProps = {
    product: {
        id: number;
        price: number;
        title: string;
    },
    onAddToWishList: (id: number) => void;
}

export function ProductItem({product, onAddToWishList}: ProductItemProps) {

    const [addingToWishList, setAddingToWishList] = useState(false)

    return (
        <div>
            {product.title} - <strong>{product.price}</strong>
            <button onClick={() => setAddingToWishList(true)}>Add to wish list</button>

            {addingToWishList && 
                <AddProductToWishList 
                    onAddToWishList={() => onAddToWishList(product.id)} 
                    onRequestClose={() => setAddingToWishList(false)}
                />
            }
        </div>
    )
}