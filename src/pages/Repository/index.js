import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropTypes from 'prop-types';

import Container from '../../components/Container';
import { Loading, Owner, IssuesList, Pages } from './styles';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page,
        },
      }),
    ]);

    console.log(issues);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { match } = this.props;
    const { page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    if (prevState.page !== page) {
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page,
        },
      });

      console.log(issues.data[0]);

      if (issues.data[0] !== undefined) {
        this.setState({
          issues: issues.data,
          loading: false,
        });
      } else {
        this.setState({
          page: page - 1,
          loading: false,
        });
      }
    }
  }

  clickNext = () => {
    const { page } = this.state;

    this.setState({
      loading: true,
      page: page + 1,
    });
  };

  clickNext = () => {
    const { page } = this.state;

    this.setState({
      loading: true,
      page: page + 1,
    });
  };

  clickAfter = () => {
    const { page } = this.state;

    this.setState({
      loading: true,
      page: page - 1,
    });
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repotitórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssuesList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>

        <Pages>
          {page !== 1 ? (
            <button onClick={this.clickAfter}>Anterior</button>
          ) : null}
          <span>{page}</span>

          <button onClick={this.clickNext}>Proximo</button>
        </Pages>
      </Container>
    );
  }
}

export default Repository;
