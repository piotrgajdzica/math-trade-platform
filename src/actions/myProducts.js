import {
  RECEIVE_ERROR_MY_ASSIGNED_PRODUCTS,
  REQUEST_MY_ASSIGNED_PRODUCTS,
  INVALIDATE_MY_ASSIGNED_PRODUCTS,
  RECEIVE_MY_ASSIGNED_PRODUCTS,
  CREATE_MY_ASSIGNED_PRODUCT,
  UPDATE_MY_ASSIGNED_PRODUCT,
} from '../reducers/myAssignedProducts';

import {
  REMOVE_MY_NOT_ASSIGNED_PRODUCT,
} from '../reducers/myNotAssignedProducts';

const VALIDATE_TIME = 1000 * 60 * 10;
const FETCHING_TIMEOUT = 1000 * 32;

const myAssignedProducts = [
  {
    id: 1,
    name: 'Fetched product1',
    description: 'This products was fetched',
    userId: 1,
    editionId: 3,
    images: [
      { uri: 'http://placekitten.com/g/620/600' },
      { uri: 'http://placekitten.com/g/450/800' },
    ],
  },
  {
    id: 2,
    name: 'Fetched product2',
    description: 'This products was fetched',
    userId: 1,
    editionId: 3,
    images: [
      { uri: 'http://placekitten.com/g/220/300' },
      { uri: 'http://placekitten.com/g/120/300' },
      { uri: 'http://placekitten.com/g/800/600' },
      { uri: 'http://placekitten.com/g/400/400' },
      { uri: 'http://placekitten.com/g/250/600' },
    ],
  },
  {
    id: 3,
    name: 'Lorem ipsum dolor sit amet',
    description: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum dictum ipsum eu elit iaculis, ut pellentesque velit sollicitudin. Donec gravida quis tellus vitae lacinia. Fusce ultricies eget erat commodo consequat.',
    userId: 1,
    editionId: 3,
    images: [
      { uri: 'http://placekitten.com/g/1100/800' },
      { uri: 'http://placekitten.com/g/120/300' },
    ],
  },
  {
    id: 4,
    name: 'In ultricies id leo ut fringilla',
    description: 'Mauris lobortis ultrices dui, varius condimentum erat efficitur ut. Donec eget augue leo. Suspendisse accumsan venenatis maximus.',
    userId: 1,
    editionId: 3,
    images: [
      { uri: 'http://placekitten.com/g/500/500' },
    ],
  },
];

function requestMyAssignedProducts(editionId) {
  return {
    type: REQUEST_MY_ASSIGNED_PRODUCTS,
    timestamp: Date.now(),
    editionId,
  };
}

function invalidateMyAssignedProducts(editionId) {
  return {
    type: INVALIDATE_MY_ASSIGNED_PRODUCTS,
    timestamp: Date.now(),
    editionId,
  };
}

function receiveMyAssignedProducts(editionId, items) {
  return {
    type: RECEIVE_MY_ASSIGNED_PRODUCTS,
    timestamp: Date.now(),
    editionId,
    items,
  };
}

function receiveErrorMyAssignedProducts(editionId) {
  return {
    type: RECEIVE_ERROR_MY_ASSIGNED_PRODUCTS,
    timestamp: Date.now(),
    editionId,
  };
}

function fetchMyAssignedProducts(editionId) {
  return async (dispatch) => {
    dispatch(requestMyAssignedProducts(editionId));
    try {
      // const items = await api.myProducts.fetchMyAssignedProducts(editionId)
      dispatch(receiveMyAssignedProducts(editionId, myAssignedProducts));
    } catch (e) {
      dispatch(receiveErrorMyAssignedProducts(editionId));
    }
  };
}


function shouldFetchMyAssignedProducts(products) {
  if (!products) {
    return true;
  }

  const {
    isFetchingSince,
    didInvalidate,
    lastSuccessfulFetch,
  } = products;

  if (
    !isFetchingSince && (didInvalidate
    || !lastSuccessfulFetch
    || (Date.now() - lastSuccessfulFetch > VALIDATE_TIME))
  ) {
    return true;
  }

  return !!(isFetchingSince && ((Date.now() - isFetchingSince) > FETCHING_TIMEOUT));
}

export function fetchMyAssignedProductsIfNeeded(editionId) {
  return (dispatch, getState) => {
    if (shouldFetchMyAssignedProducts(getState().myAssignedProducts.productsByEdition[editionId])) {
      return dispatch(fetchMyAssignedProducts(editionId));
    }

    return Promise.resolve('There is no need of fetch');
  };
}

export function createProduct(editionId, name, description, images) {
  return async (dispatch) => {
    // const item = await api.myProducts.createProduct()
    dispatch({
      type: CREATE_MY_ASSIGNED_PRODUCT,
      editionId,
      item: {
        id: Math.floor(Math.random() * 1000000),
        userId: 1,
        name,
        editionId,
        description,
        images,
      },
    });
  };
}

export function updateMyAssignedProduct(editionId, id, name, description, images) {
  return async (dispatch) => {
    // const item = await api.myProducts.updateProduct()
    dispatch({
      type: UPDATE_MY_ASSIGNED_PRODUCT,
      editionId,
      item: {
        id,
        userId: 1,
        name,
        editionId,
        description,
        images,
      },
    });
  };
}

function removeMyNotAssignedProduct(itemId) {
  return {
    type: REMOVE_MY_NOT_ASSIGNED_PRODUCT,
    itemId,
  };
}

export function assignProductToEdition(editionId, itemId) {
  return async (dispatch, getState) => {
    // const items = await api.myProducts.assignProductToEdition(editionId, productId)

    // TODO: replace getState with returned value!!
    const item = getState().myNotAssignedProducts.items.filter(i => i.id === itemId)[0];

    dispatch({
      type: CREATE_MY_ASSIGNED_PRODUCT,
      editionId,
      item: {
        ...item,
        editionId,
      },
    });

    dispatch(removeMyNotAssignedProduct(itemId));
  };
}

export default {
  fetchMyAssignedProductsIfNeeded,
  createProduct,
  updateMyAssignedProduct,
  assignProductToEdition,
};
