import type { GetServerSideProps, NextPage } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import React, { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import styles from "../styles/Home.module.css"
import { withSSRGuest } from "../utils/withSSRGuest"

const Home: NextPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { isAuthenticated, signIn } = useAuth()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      email,
      password,
    }
    await signIn(data)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={(e) => handleSubmit(e)}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type={"submit"} value={"Enviar"} />
      </form>
    </div>
  )
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  }
})

export default Home
