import React, { useContext, useState, useEffect } from 'react';

/*type Props = {
    combinator: any;
    defaultValue: any;
    children: (any) => any;
};

type State = {
    value: any;
};*/

const Plug = ({ combinator, children, defaultValue = null }) => {
    const [value, setValue] = useState(defaultValue);

    return null;
};

class Connector extends React.Component {
    static defaultProps: Partial<Props> = {
        defaultValue: null
    };

    static contextTypes = {
        store: PropTypes.object.isRequired
    };

    stream: any;
    listener: any;

    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            value: props.defaultValue
        };

        this.stream = props.combinator(context.store);
        this.listener = {
            next: value =>
                !!this &&
                this.setState({
                    value
                })
        };
    }

    componentDidMount() {
        this.stream.addListener(this.listener);
    }

    componentWillUnmount() {
        this.stream.removeListener(this.listener);
    }

    render() {
        return this.props.children(this.state.value);
    }
}

export default Connector;
