/* eslint-disable no-loop-func */
import React from 'react';

class Table extends React.Component {
    EPSILON = 'ε';

    buildParsingTable = (grammar) => {
        var parsingTable = {};

        for (var k in grammar) {
            var production = grammar[k];
            var LHS = this.getLHS(production);
            var RHS = this.getRHS(production);
            var productionNumber = Number(k);

            // Init columns for this non-terminal.
            if (!parsingTable[LHS]) {
                parsingTable[LHS] = {};
            }

            // All productions goes under the terminal column, if
            // this terminal is not epsilon.
            if (RHS !== this.EPSILON) {
                this.getFirstSetOfRHS(RHS).forEach((terminal) => {
                    parsingTable[LHS][terminal] = productionNumber;
                });
            } else {
                // Otherwise, this ε-production goes under the columns from
                // the Follow set.
                this.followSets[LHS].forEach(function (terminal) {
                    parsingTable[LHS][terminal] = productionNumber;
                });
            }
        }

        return parsingTable;
    }

    getLHS = (production) => {
        return production.split('->')[0].replace(/\s+/g, '');
    }

    getRHS = (production) => {
        return production.split('->')[1].replace(/\s+/g, '');
    }

    getFirstSetOfRHS = (RHS) => {

        // For simplicity, in this educational parser, we assume that
        // the first symbol (if it's a non-terminal) cannot produces `ε`.
        // Since in real parser, we need to get the First set of the whole RHS.
        // This means, that if `B` in the production `X -> BC` can be `ε`, then
        // the First set should of course include First(C) as well, i.e. RHS[1], etc.

        // That is, in a real parser, one usually combines steps of building a
        // parsing table, First and Follow sets in one step: when a parsing table
        // needs the First set of a RHS, it's calculated in place.

        // But here we just return First of RHS[0].


        return this.firstSets[RHS[0]];
    }


    getNonTerminals = () => {
        // Small case letters in FirstSets
        var nonTerminals = [];
        Object.keys(this.firstSets).forEach((symbol) => {
            if (symbol >= 'A' && symbol <= 'Z')
                nonTerminals.push(symbol)
        })
        
        return nonTerminals
    }
    getTerminals = () => {
        // Small case letters in FirstSets
        var terminals = [];
        Object.keys(this.firstSets).forEach((symbol) => {
            if (!(symbol >= 'A' && symbol <= 'Z'))
                terminals.push(symbol)
        })
        return terminals
    }

    // createTable = () => {

    // }


    // grammar = {
    //     1: 'E -> TX',
    //     2: 'X -> +TX',
    //     3: 'X -> ε',
    //     4: 'T -> FY',
    //     5: 'Y -> *FY',
    //     6: 'Y -> ε',
    //     7: 'F -> a',
    //     8: 'F -> (E)',
    // };

    // firstSets = {
    //     'E': ['a', '('],
    //     'T': ['a', '('],
    //     'F': ['a', '('],
    //     'a': ['a'],
    //     '(': ['('],
    //     'X': ['+', 'ε'],
    //     '+': ['+'],
    //     'Y': ['*', 'ε'],
    //     '*': ['*'],
    // };

    // followSets = {
    //     'E': ['$', ')'],
    //     'X': ['$', ')'],
    //     'T': ['+', '$', ')'],
    //     'Y': ['+', '$', ')'],
    //     'F': ['*', '+', '$', ')'],
    // };

    grammar = {};

    firstSets = {};

    followSets = {};

    table = {};

    render() {
        this.grammar = this.props.grammar;
        this.firstSets = this.props.firstSets;
        this.followSets = this.props.followSets;

        console.log("TABLE")
        this.table = this.buildParsingTable(this.grammar);
        console.log(this.table);

        var terminals = this.getTerminals();
        console.log(terminals)
        var nonTerminals = this.getNonTerminals();

        return (
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Symbols</th>
                            {terminals.map((symbol) => {
                                return <th scope="col" key={symbol}>{symbol}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(this.table)
                                .map((symbol) => {
                                    return <tr key={symbol}>
                                        <th scope="row">{symbol}</th>
                                        {terminals.map((terminal) => {
                                            return <td key={terminal}>
                                                {
                                                    this.table[symbol][terminal]
                                                        ?   this.grammar[this.table[symbol][terminal]]
                                                        :   "---"
                                                }
                                            </td>
                                        })}
                                    </tr>
                                })
                        }
                        {/* {terminals.map((symbol) => {
                            return <tr key={symbol}>
                                <th scope="row">{symbol}</th>
                                {nonTerminals.map((symbol, index) => {
                                    return <td key={index}>{index}</td>
                                })}
                            </tr>
                        })} */}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Table;