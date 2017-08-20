import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchSurveys } from '../../actions';

class SurveyList extends Component {
  componentDidMount() {
    this.props.fetchSurveys();
  }

  renderSurveys() {
    return this.props.surveys.reverse().map(survey => {
      const { _id, title, body, dateSent, lastResponded, yes, no } = survey;
      return (
        <div className="card blue-grey darken-1" key={_id}>
          <div className="card-content white-text">
            <span className="card-title">
              {title}
            </span>
            <p>
              {body}
            </p>
            <p className="right">
              Send On: {new Date(dateSent).toLocaleDateString()}
              , Last Responded: {new Date(lastResponded).toLocaleDateString()}
            </p>
          </div>
          <div className="card-action">
            <a>
              Yes: {yes}
            </a>
            <a>
              No: {no}
            </a>
          </div>
        </div>
      );
    });
  }

  render() {
    return (
      <div>
        {this.renderSurveys()}
      </div>
    );
  }
}

const mapStateToProps = ({ surveys }) => {
  return { surveys };
};

export default connect(mapStateToProps, { fetchSurveys })(SurveyList);
