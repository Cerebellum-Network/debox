import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {ConditionsList} from './conditions-list';
import {Condition} from './condition';
import {Interactive, Unknown} from './fixtures';
import {Defaults} from './defaults';

describe('src/shared/components/Conditions', () => {
  it('should render one of suitable conditions', () => {
    render(
      <ConditionsList>
        <Condition condition>
          <div>Condition A</div>
        </Condition>
        <Condition condition={false}>
          <div>Condition B</div>
        </Condition>
      </ConditionsList>,
    );
    expect(screen.queryByText('Condition A')).toBeInTheDocument();
    expect(screen.queryByText('Condition B')).not.toBeInTheDocument();
  });

  it('should render only first of suitable conditions', () => {
    render(
      <ConditionsList>
        <Condition condition>
          <div>Condition A</div>
        </Condition>
        <Condition condition>
          <div>Condition B</div>
        </Condition>
        <Condition condition={false}>
          <div>Condition C</div>
        </Condition>
      </ConditionsList>,
    );
    expect(screen.queryByText('Condition A')).toBeInTheDocument();
    expect(screen.queryByText('Condition B')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition C')).not.toBeInTheDocument();
  });

  it('should render all suitable condition if multiply true', () => {
    render(
      <ConditionsList multiply>
        <Condition condition>
          <div>Condition A</div>
        </Condition>
        <Condition condition>
          <div>Condition B</div>
        </Condition>
        <Condition condition={false}>
          <div>Condition C</div>
        </Condition>
      </ConditionsList>,
    );
    expect(screen.queryByText('Condition A')).toBeInTheDocument();
    expect(screen.queryByText('Condition B')).toBeInTheDocument();
    expect(screen.queryByText('Condition C')).not.toBeInTheDocument();
  });

  it('should ignore wrong children', () => {
    render(
      <ConditionsList>
        <Unknown>Wrong child</Unknown>
        <Condition condition>
          <div>Condition A</div>
        </Condition>
        <Condition condition>
          <div>Condition B</div>
        </Condition>
        <Condition condition={false}>
          <div>Condition C</div>
        </Condition>
      </ConditionsList>,
    );
    expect(screen.queryByText('Wrong child')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition A')).toBeInTheDocument();
    expect(screen.queryByText('Condition B')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition C')).not.toBeInTheDocument();
  });

  it('should render defaults if nothing else matches', () => {
    render(
      <ConditionsList>
        <Unknown>Wrong child</Unknown>
        <Condition condition={false}>
          <div>Condition A</div>
        </Condition>
        <Condition condition={false}>
          <div>Condition B</div>
        </Condition>
        <Condition condition={false}>
          <div>Condition C</div>
        </Condition>
        <Defaults>
          <div>Defaults</div>
        </Defaults>
      </ConditionsList>,
    );
    expect(screen.queryByText('Wrong child')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition A')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition B')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition C')).not.toBeInTheDocument();
    expect(screen.queryByText('Defaults')).toBeInTheDocument();
  });

  it('should update the content properly', () => {
    render(
      <Interactive>
        {(state) => (
          <ConditionsList>
            <Unknown>Wrong child</Unknown>
            <Condition condition={state}>
              <div>Dynamic condition</div>
            </Condition>
            <Condition condition>
              <div>Condition A</div>
            </Condition>
            <Condition condition={false}>
              <div>Condition B</div>
            </Condition>
          </ConditionsList>
        )}
      </Interactive>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    expect(screen.queryByText('Wrong child')).not.toBeInTheDocument();
    expect(screen.queryByText('Dynamic condition')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition A')).toBeInTheDocument();
    expect(screen.queryByText('Condition B')).not.toBeInTheDocument();

    userEvent.click(button);
    expect(screen.queryByText('Wrong child')).not.toBeInTheDocument();
    expect(screen.queryByText('Dynamic condition')).toBeInTheDocument();
    expect(screen.queryByText('Condition A')).not.toBeInTheDocument();
    expect(screen.queryByText('Condition B')).not.toBeInTheDocument();
  });
});
