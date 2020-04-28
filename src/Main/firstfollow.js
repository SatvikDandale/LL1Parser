/* eslint-disable no-loop-func */
import React from 'react';
import Table from './parseTable';

import './firstfollow.css';

class FirstFollow extends React.Component {

    buildFirstSets = (grammar) => {
        this.firstSets = {};
        this.buildSet(this.firstOf);
    }

    firstOf = (symbol) => {

        // A set may already be built from some previous analysis
        // of a RHS, so check whether it's already there and don't rebuild.
        if (this.firstSets[symbol]) {
            return this.firstSets[symbol];
        }

        // Else init and calculate.
        var first = this.firstSets[symbol] = {};

        // If it's a terminal, its first set is just itself.
        if (this.isTerminal(symbol)) {
            first[symbol] = true;
            return this.firstSets[symbol];
        }

        var productionsForSymbol = this.getProductionsForSymbol(symbol);
        for (var k in productionsForSymbol) {
            var production = this.getRHS(productionsForSymbol[k]);

            for (var i = 0; i < production.length; i++) {
                var productionSymbol = production[i];

                // Epsilon goes to the first set.
                if (productionSymbol === this.EPSILON) {
                    first[this.EPSILON] = true;
                    break;
                }

                // Else, the first is a non-terminal,
                // then first of it goes to first of our symbol
                // (unless it's an epsilon).
                var firstOfNonTerminal = this.firstOf(productionSymbol);

                // If first non-terminal of the RHS production doesn't
                // contain epsilon, then just merge its set with ours.
                if (!firstOfNonTerminal[this.EPSILON]) {
                    this.merge(first, firstOfNonTerminal);
                    break;
                }

                // Else (we got epsilon in the first non-terminal),
                //
                //   - merge all except for epsilon
                //   - eliminate this non-terminal and advance to the next symbol
                //     (i.e. don't break this loop)
                this.merge(first, firstOfNonTerminal, [this.EPSILON]);
                // don't break, go to the next `productionSymbol`.
            }
        }

        return first;
    }

    getProductionsForSymbol = (symbol) => {
        var productionsForSymbol = {};
        for (var k in this.grammar) {
            if (this.grammar[k][0] === symbol) {
                productionsForSymbol[k] = this.grammar[k];
            }
        }
        return productionsForSymbol;
    }

    getLHS = (production) => {
        return production.split('->')[0].replace(/\s+/g, '');
    }

    getRHS = (production) => {
        return production.split('->')[1].replace(/\s+/g, '');
    }

    buildFollowSets = (grammar) => {
        this.followSets = {};
        this.buildSet(this.followOf);
    }

    followOf = (symbol) => {

        // If was already calculated from some previous run.
        if (this.followSets[symbol]) {
            return this.followSets[symbol];
        }

        // Else init and calculate.
        var follow = this.followSets[symbol] = {};

        // Start symbol always contain `$` in its follow set.
        if (symbol === this.START_SYMBOL) {
            follow['$'] = true;
        }

        // We need to analyze all productions where our
        // symbol is used (i.e. where it appears on RHS).
        var productionsWithSymbol = this.getProductionsWithSymbol(symbol);
        for (var k in productionsWithSymbol) {
            var production = productionsWithSymbol[k];
            var RHS = this.getRHS(production);

            // Get the follow symbol of our symbol.
            var symbolIndex = RHS.indexOf(symbol);
            var followIndex = symbolIndex + 1;

            // We need to get the following symbol, which can be `$` or
            // may contain epsilon in its first set. If it contains epsilon, then
            // we should take the next following symbol: `A -> aBCD`: if `C` (the
            // follow of `B`) can be epsilon, we should consider first of `D` as well
            // as the follow of `B`.

            while (true) {

                if (followIndex === RHS.length) { // "$"
                    var LHS = this.getLHS(production);
                    if (LHS !== symbol) { // To avoid cases like: B -> aB
                        this.merge(follow, this.followOf(LHS));
                    }
                    break;
                }

                var followSymbol = RHS[followIndex];

                // Follow of our symbol is anything in the first of the following symbol:
                // followOf(symbol) is firstOf(followSymbol), except for epsilon.
                var firstOfFollow = this.firstOf(followSymbol);

                // If there is no epsilon, just merge.
                if (!firstOfFollow[this.EPSILON]) {
                    this.merge(follow, firstOfFollow);
                    break;
                }

                this.merge(follow, firstOfFollow, [this.EPSILON]);
                followIndex++;
            }
        }

        return follow;
    }

    buildSet = (builder) => {
        for (var k in this.grammar) {
            builder(this.grammar[k][0]);
        }
    }

    getProductionsWithSymbol = (symbol) => {
        var productionsWithSymbol = {};
        for (var k in this.grammar) {
            var production = this.grammar[k];
            var RHS = this.getRHS(production);
            if (RHS.indexOf(symbol) !== -1) {
                productionsWithSymbol[k] = production;
            }
        }
        return productionsWithSymbol;
    }

    isTerminal = (symbol) => {
        return !/[A-Z]/.test(symbol);
    }

    merge = (to, from, exclude) => {
        exclude || (exclude = []);
        for (var k in from) {
            if (exclude.indexOf(k) === -1) {
                to[k] = from[k];
            }
        }
    }

    printGrammar = (grammar) => {
        console.log('Grammar:\n');
        for (var k in grammar) {
            console.log('  ', grammar[k]);
        }
        console.log('');
    }

    printSet = (name, set) => {
        console.log(name + ': \n');
        for (var k in set) {
            console.log('  ', k, ':', Object.keys(set[k]));
        }
        console.log('');
    }

    setElement = (set) => {
        return Object.keys(set).map((symbol, index) => {
            return (
                <tr key={symbol + index}>
                    <th scope="row">{index + 1}</th>
                    <td>{symbol}</td>
                    <td>{Object.keys(set[symbol]).map((firstSymbol) => {
                        return firstSymbol + " "
                    })}</td>
                </tr>
            )
        })
    }

    // grammar = {
    //     1: 'S -> F',
    //     2: 'S -> (S + F)',
    //     3: 'F -> a',
    // };

    
    EPSILON = "ε";
    
    grammar = {}
    firstSets = {};
    followSets = {};

    START_SYMBOL = '';

    convertSets = (set) => {
        // The sets have elements with their boolean true or false.
        // Just want the elements
        var newSet = {}
        for (var symbol in set){
            var tempList = [];
            Object.keys(set[symbol]).forEach((firstEntry) => {
                if (set[symbol][firstEntry])
                    tempList.push(firstEntry)
            })
            newSet[symbol] = tempList;
        }
        return newSet;
    }

    render() {
        this.grammar = this.props.grammar;
        this.START_SYMBOL = this.props.startSymbol;

        this.printGrammar(this.grammar);

        this.buildFirstSets(this.grammar);
        this.printSet('First sets', this.firstSets);

        this.buildFollowSets(this.grammar);
        this.printSet('Follow sets', this.followSets);

        var newFirsts = this.convertSets(this.firstSets);
        var newFollows = this.convertSets(this.followSets);

        return (
            <div className="tables-row">
                <div className="table-left">
                    <h3>Firsts Set of the grammar</h3>
                    <br />
                    <table className="first-table table table-hover table-sm">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Symbol</th>
                                <th scope="col">First Set</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.setElement(this.firstSets)}
                        </tbody>
                    </table>
                    <h3>Follows Set of the Grammar</h3>
                    <br />
                    <table className="follow-table table table-hover table-sm">
                    <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Symbol</th>
                                <th scope="col">Follow Set</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.setElement(this.followSets)}
                        </tbody>
                    </table>
                </div>
                <div className="spacer"></div>
                <div className="table-right">
                    <h3>Parse Table</h3>
                    <br/>
                    <Table 
                        grammar={this.props.grammar}
                        firstSets={newFirsts}
                        followSets={newFollows}
                    ></Table>
                </div>
            </div>
        );
    }
}

export default FirstFollow;