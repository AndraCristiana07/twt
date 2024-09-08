import React, { createContext, useState } from 'react';

export const TweetsContext = createContext();

const TweetsProvider = ({ children }) => {
    const [tweets, setTweets] = useState([]);

    return (
        <TweetsContext.Provider value={{ tweets, setTweets }}>
            {children}
        </TweetsContext.Provider>
    );
};

export default TweetsProvider;
