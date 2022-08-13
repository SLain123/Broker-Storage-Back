export enum Error {
    somethingWrong = 'Something was wrong...',
    alreadyExistsUser = 'User email already exists!',
    unexistedUser = "User doesn't exist!",
    userNotFound = 'User not found',

    incorrectPassword = 'Password incorrect!',
    incorrectToker = 'Token uncorrect',
    missingToker = 'Unauthorized! Token missing in the request',

    currencyNotFound = 'Currency was not found',
    unexistedCurrency = 'No currency exists',

    brokerNotFound = 'Broker account was not found or inactive',
    stockNotFound = 'Stock not found',
    inactiveBroker = 'Broker status is inactive',

    wrongBrokerId = 'Wrong broker id format',
    wrongCurrencyId = 'Wrong currency id format',
    wrongYear = 'Wrong year format',
    wrongStatus = 'Unexisting status',
    wrongType = 'Unexisting type',
    notEnoughtCash = 'Not enough cash for purchase',

    unexistedStock = "Stock doesn't belong to the user or not exists",
    inactiveStock = 'Stock already have closed status',
    firstStockCantBeDeleted = 'Stock cannot be deleted because this operation is first and still exists other operations',
    historyStockNotFound = 'Item of history was not found in main stock',
    sellBeforeBuing = "Error! Sell operation must't exist before buy",
    sellCountGreaterBuy = 'Error! Count of sell operations exceeds buy',

    divNotFound = "Payment doesn't belong to the user or not exists",

    activeNotFound = "Active doesn't belong to the user or not exists",
    unexistedActive = "Active doesn't belong to the user or not exists",
    inactiveActive = 'Active already have closed status',
}

export enum Success {
    success = 'Success!',
    userCreate = 'User was create!',
    userFound = 'User found',
    userChanged = 'User data has been changed',

    tokenOk = 'Token correct',

    brokerFound = 'Broker account(s) has been find',
    createdBroker = 'Broker account has been created',
    removedBroker = 'Broker account has been removed',
    brokerChanged = 'Broker account cash or/and status was corrected',

    stockFound = 'Stoсk was found',
    stocksFound = 'Stocks were found',
    stockCreated = 'Stock was created as purchased',
    stockRemoved = 'Stock was removed',

    dividendCreated = 'Payment was added in user data',
    dividendRemoved = 'Payment was removed from user data',

    activeCreated = 'Active was added in user data',
    activeCorrected = 'Active data were corrected',
    activeRemoved = 'Active was removed from user data',
    activesFound = 'Actives were found',
    activeFound = 'Active was found',
}

export enum Val {
    wrongEmail = 'Wrong email format',
    incorrectEmail = 'Type correct email',

    incorrectPassword = 'Uncorrect password, minimum 6 symbols',
    emptyPassword = 'Type password',

    incorrectDefCurrencyId = 'Default currency ID was not recived or incorrect',
    incorrectCurrencyId = 'Currency ID was not recived or incorrect',
    incorrectBrokerId = 'Broker ID was not recived or incorrect',
    incorrectId = 'ID was not recived or incorrect',

    missingBrokerTitle = 'Title of broker is missing',
    incorrectTitle = 'Incorrect title',
    missingStockTitle = 'Title of the stock was not received',
    missingActiveTitle = 'Title of the active was not received',

    missingNick = 'User nick name is missing',
    cashNotRecived = 'Cash sum was not recived',
    incorrectStatus = 'Incorrect status',
    wrongAvatar = 'Avatar must be base64 format',
    incorrectFilters = 'Incorrect filter format or no existing filter name',
    missingDate = 'Date was missing',
    missingCount = 'Count of the stock was not specified',
    missingSinglePrice = 'Price per one of stock was not recieved',
    missingFee = "Broker's fee was not recieved",
    missingType = 'Type of stock was not recived',
    missingAction = '"Buy" or "Sell" action must specifyed',
    missingPayment = 'Sum of payment was not recieved',

    wrongYear = 'Year must be between 2000 and 2100',
}
