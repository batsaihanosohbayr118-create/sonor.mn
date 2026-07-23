import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { readFacts, Fact } from '@/lib/factsStore';

export const getServerSideProps: GetServerSideProps<{ facts: Fact[] }> = async () => {
  return { props: { facts: await readFacts() } };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function FactCheck({ facts }: Props) {
  return (
    <div className="policy">
      <h1>Баримт шалгах</h1>
      <div className="trustgrid">
        {facts.map(fact => (
          <div className="t" key={fact.id}>
            <b>{fact.vlabel}</b>
            <p>{fact.claim}</p>
            <small>{fact.exp}</small>
          </div>
        ))}
      </div>
    </div>
  );
}