import React from 'react';
import styles from '../../styles/loading-circle.module.css';
const LoadingCircle = () => {

    return (
        <div className="loading-circle  ">
            <div className="inner-loading">
                <div className="after"></div>
            </div>
        </div>
    );
};

export default LoadingCircle;
