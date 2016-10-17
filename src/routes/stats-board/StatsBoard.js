import React, { Component } from 'react';
import { connect } from 'react-redux'
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import mathjs from 'mathjs';
import pretty from 'prettysize';
import Layout from '../../components/Layout';

import { ListGroup, ListGroupItem, Badge } from 'react-bootstrap';

import ProgressBar from '../../components/ProgressBar/ProgressBar';

import * as statsAction from '../../actions/stats';

import s from './stats-board.css';

const mapStateToProps = (state) => {
  return {
    isChecking: state.stats.get('isChecking'),
    disk: state.stats.get('disk'),
    cpu: state.stats.get('cpu'),
    memory: state.stats.get('memory'),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkDiskSpace: () => dispatch(statsAction.diskUsage())
  }
};

class StatsBoard extends Component
{
  interval = null;

  constructor(...props) {
    super(...props);

    this.state = {};
  }

  componentDidMount() {
    // ...
    this.props.checkDiskSpace();
    this.interval = setInterval(this.props.checkDiskSpace, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  _renderContent() {
    const { disk, cpu, memory } = this.props;

    return (
      <div>
        <div className={s.chartSection}>
          <ListGroup>
            <ListGroupItem className={s.label}>
              <i className="fa fa-database" aria-hidden="true" />
              Disk Space <Badge>Available: { mathjs.round(disk.get('availablePercentage'), 2) }%</Badge>
            </ListGroupItem>
            <ListGroupItem>
              <ProgressBar percentage={ 100 - disk.get('availablePercentage') } />
            </ListGroupItem>
            <ListGroupItem><strong>Free Space:</strong> { pretty(disk.get('free')) }</ListGroupItem>
            <ListGroupItem><strong>Total Space:</strong> { pretty(disk.get('total')) }</ListGroupItem>
          </ListGroup>
          <ListGroup>
            <ListGroupItem className={s.label}>
              <i className="fa fa-tachometer" aria-hidden="true" />
              Memory <Badge>Available: { mathjs.round(memory.get('percentage'), 2) }%</Badge>
            </ListGroupItem>
            <ListGroupItem>
              <ProgressBar percentage={mathjs.round(100 - memory.get('percentage'), 2)} />
            </ListGroupItem>
            <ListGroupItem><strong>Free Memory:</strong> { pretty(memory.get('free')) }</ListGroupItem>
            <ListGroupItem><strong>Total Memory:</strong> { pretty(memory.get('total')) }</ListGroupItem>
          </ListGroup>
        </div>
        <div className={s.chartSection}>
          <ListGroup>
            <ListGroupItem className={s.label}>
              <i className="fa fa-cogs" aria-hidden="true" />
              Overall CPU Usage
            </ListGroupItem>
            <ListGroupItem>
              <ProgressBar percentage={mathjs.round(cpu.get('percentage'), 2)} />
            </ListGroupItem>
          </ListGroup>
          {
            cpu.get('all').map((data, i) => {
              return (
                <ListGroup key={`stat-cpu-${i}`}>
                  <ListGroupItem className={s.label}>
                    <i className="fa fa-cogs" aria-hidden="true" />
                    CPU {i} Usage
                  </ListGroupItem>
                  <ListGroupItem>
                    <ProgressBar percentage={mathjs.round(data.percentage, 2)} />
                  </ListGroupItem>
                </ListGroup>
              )
            })
          }
        </div>
      </div>
    )
  }

  render() {
    return (
      <Layout>
        <div className={s.root}>
          <div className={s.container}>
            {this._renderContent()}
          </div>
        </div>
      </Layout>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(s)(StatsBoard));