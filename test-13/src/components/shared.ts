import { css } from 'lit';

export const panelStyles = css`
  .panel {
    padding: 1rem;
    border-radius: 16px;
    background: rgba(17, 24, 39, 0.88);
    border: 1px solid rgba(148, 163, 184, 0.14);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: start;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 700;
  }

  .subtle {
    color: #96a5bd;
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .error {
    margin-top: 0.75rem;
    color: #ffb4b4;
    font-size: 0.92rem;
  }

  label span {
    display: block;
    margin-bottom: 0.35rem;
    color: #b6c1d4;
    font-size: 0.92rem;
  }

  input,
  select,
  button {
    font: inherit;
  }

  input,
  select {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(11, 16, 32, 0.9);
    color: #ecf1f8;
    border-radius: 12px;
    padding: 0.72rem 0.82rem;
    box-sizing: border-box;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 0.72rem 1rem;
    cursor: pointer;
  }

  button.primary {
    background: #7dd3fc;
    color: #0a1624;
  }

  button.secondary {
    background: #243145;
    color: #ecf1f8;
  }

  button:disabled {
    opacity: 0.55;
    cursor: default;
  }

  .field-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: end;
  }

  .labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .label {
    border-radius: 999px;
    padding: 0.24rem 0.55rem;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.18);
    color: #bfefff;
    font-size: 0.82rem;
  }

  a {
    color: #8fd7ff;
  }

  @media (max-width: 720px) {
    .field-row {
      grid-template-columns: 1fr;
    }
  }
`;

export const listStyles = css`
  .list {
    display: grid;
    gap: 0.65rem;
  }

  .list-item {
    text-align: left;
    width: 100%;
    padding: 0.9rem;
    border-radius: 14px;
    background: rgba(11, 16, 32, 0.82);
    border: 1px solid rgba(148, 163, 184, 0.14);
    color: inherit;
  }

  .list-item.selected {
    border-color: rgba(125, 211, 252, 0.45);
    box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.22);
  }

  .static-item {
    cursor: default;
  }

  .item-title-row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: start;
  }

  .item-title {
    margin-top: 0.35rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .item-meta {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
    color: #96a5bd;
    font-size: 0.88rem;
  }

  .issue-number,
  .bookmark {
    color: #7dd3fc;
    font-size: 0.85rem;
  }
`;

export const markdownStyles = css`
  .body {
    white-space: pre-wrap;
    line-height: 1.55;
    color: #dce6f3;
  }
`;
