import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '../index';

import { Pagination, PaginationItem } from '@mui/material';

interface paginationProps {
    page: number | string
}

const CustpmPagination: React.FC<paginationProps> = ({ page }) => {
    const { noOfPages } = useSelector((state: RootState) => state.posts);

    return (
        <Pagination
            count={noOfPages}
            page={Number(page)}
            variant="outlined"
            color="primary"
            renderItem={(item) => (
                <PaginationItem {...item} component={Link} to={`/posts?page=${item.page}`} />
            )}
        />
    );
};

export default CustpmPagination;